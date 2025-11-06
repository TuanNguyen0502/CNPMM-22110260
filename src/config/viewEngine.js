import express from "express";

let configureViewEngine = (app) => {
  app.use(express.static("./src/public")); // For serving static files

  app.set("view engine", "ejs"); // Set EJS as the templating engine
  app.set("views", "./src/views"); // Set the views directory
};

module.exports = configureViewEngine;
