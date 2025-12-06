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
import FavoritesPage from "./pages/favorites.jsx";
import CheckoutPage from "./pages/checkout.jsx";

// Define the routes for the application using React Router
// Each route maps a URL path to a specific component
// Nested routes are used for pages that share a common layout (App component)
const router = createBrowserRouter([
  {
    path: "/", // Root path
    element: <App />, // Main layout component
    children: [
      { index: true, element: <HomePage /> }, // Default child route for "/"
      { path: "user", element: <UserPage /> }, // User profile page route /user renders UserPage
      { path: "products", element: <ProductPage /> }, // Products listing page route /products renders ProductPage
      { path: "cart", element: <CartPage /> }, // Shopping cart page route /cart renders CartPage

      { path: "products/:id", element: <ProductDetail /> }, // Product detail page route /products/:id renders ProductDetail
      { path: "favorites", element: <FavoritesPage /> }, // Favorites page route /favorites renders FavoritesPage
      { path: "checkout", element: <CheckoutPage /> }, // Checkout page route /checkout renders CheckoutPage
    ],
  },
  // define standalone routes outside the main App layout
  // for pages like registration and login
  // these pages do not use the App component as their layout
  // they are rendered independently
  // this allows for different layouts or no layout at all
  {
    path: "register", // Registration page route /register renders RegisterPage
    element: <RegisterPage />,
  },
  {
    path: "login", // Login page route /login renders LoginPage
    element: <LoginPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Wrap the application with AuthWrapper to provide authentication context */}
    <AuthWrapper>
      {/* Wrap the application with ApolloProvider to provide Apollo Client for GraphQL */}
      <ApolloProvider client={client}>
        {/* Wrap the application with CartWrapper to provide cart context */}
        <CartWrapper>
          {/* Provide the router to the application */}
          <RouterProvider router={router} />
        </CartWrapper>
      </ApolloProvider>
    </AuthWrapper>
  </React.StrictMode>
);
