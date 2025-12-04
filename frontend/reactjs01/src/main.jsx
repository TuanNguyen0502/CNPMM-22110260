import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RegisterPage from "./pages/register.jsx";
import UserPage from "./pages/user.jsx";
import HomePage from "./pages/home.jsx";
import LoginPage from "./pages/login.jsx";
import { AuthWrapper } from "./components/context/auth.context.jsx";
import { CartWrapper } from "./components/context/cart.context.jsx";
import ProductPage from "./pages/product.jsx";
import CartPage from "./pages/cart.jsx";

import { ApolloProvider } from "@apollo/client";
import client from "./config/apollo";

import ProductDetail from "./pages/product-detail.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "user", element: <UserPage /> },
      { path: "products", element: <ProductPage /> },
      { path: "cart", element: <CartPage /> },

      { path: "products/:id", element: <ProductDetail /> },
    ],
  },
  {
    path: "register",
    element: <RegisterPage />,
  },
  {
    path: "login",
    element: <LoginPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthWrapper>
      <ApolloProvider client={client}>
        <CartWrapper>
          <RouterProvider router={router} />
        </CartWrapper>
      </ApolloProvider>
    </AuthWrapper>
  </React.StrictMode>
);
