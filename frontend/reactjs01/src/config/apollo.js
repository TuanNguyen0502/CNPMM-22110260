import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// 1. Cấu hình endpoint GraphQL của backend
const httpLink = createHttpLink({
  uri: "http://localhost:8080/graphql",
});

// 2. Middleware để lấy Token từ localStorage và gắn vào Header
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("access_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// 3. Khởi tạo Client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
