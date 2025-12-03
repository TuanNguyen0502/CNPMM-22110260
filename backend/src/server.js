require("dotenv").config();

const express = require("express");
const cors = require("cors");
const configViewEngine = require("./config/viewEngine");
const apiRoutes = require("./routes/api");
const { connection } = require("./config/database");
const { getHomePage } = require("./controllers/homeController");

const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const User = require("./models/user");

// Import GraphQL schema & resolvers
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

configViewEngine(app);

const webAPI = express.Router();
webAPI.get("/", getHomePage);
app.use("/", webAPI);
app.use("/v1/api", apiRoutes);

// --- CẤU HÌNH GRAPHQL ---
const startGraphQLServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(
    "/graphql",
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      // Context function: Chạy mỗi request để xác thực user
      context: async ({ req }) => {
        const token = req.headers.authorization?.split(" ")[1] || "";
        if (!token) return { user: null };

        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          // Tìm user trong DB để chắc chắn user tồn tại và lấy ID chuẩn
          const user = await User.findOne({ where: { email: decoded.email } });
          return { user };
        } catch (err) {
          return { user: null };
        }
      },
    })
  );
};

(async () => {
  try {
    await connection();
    await startGraphQLServer();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`GraphQL Server is ready at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
})();
