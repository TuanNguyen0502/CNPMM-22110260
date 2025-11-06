import express from 'express';
import bodyParser from 'body-parser';
import configureViewEngine from './config/viewEngine.js';
import initWebRoutes from './route/web';
import connectDB from './config/connectDB.js';
require('dotenv').config(); // Load environment variables from .env file

let app = express();

// Configure app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
configureViewEngine(app);
initWebRoutes(app);
connectDB();

let port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});