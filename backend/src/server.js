require("dotenv").config();

const express = require("express");
const cors = require("cors");
const configViewEngine = require("./config/viewEngine");
const apiRoutes = require("./routes/api");
const { connection } = require("./config/database");
const { getHomePage } = require("./controllers/homeController");

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
(async () => {
  try {
    await connection();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
})();
