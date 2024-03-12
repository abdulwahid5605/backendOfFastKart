// server is build with the help of express js

// importing express from app.js file
const app = require("./app");

const cloudinary = require("cloudinary");

// importing function used to connect db
const connectDatabase = require("./config/database");

// Uncaught Errors: When some variable is not declared and we are using it in a script then it will crash the server(we want it to crash the server) but don't print some proper message
process.on("uncaughtException", (error) => {
  console.log(`Error:${error.message}`);
  console.log("Shutting down the server due to Uncaught Exception");
  // we have not crahed the server here because server is already crashed, just exiting from the process
  process.exit(1);
});

// importing dotenv library. How this file will come to know the values of variable that we are giving in config.env file?
const dotenv = require("dotenv");

dotenv.config({ path: "backend/config/config.env" });

// it is necessary to add connectDatabase function afterthe dotenv file because "process.env.DB_URI" is the variable that is being imported from dotenv file
connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// listen is used to start the web server. It listens all of the http requests
// it requires a port number. We are giving the values of variables using "dotenv" library
// Storing server in to "server" variable to shut it down
const server = app.listen(process.env.PORT, () => {
  console.log(`server is running on http://localhost:${process.env.PORT}`);
});

// this type of error is known as uncaught error
// console.log(youtube)

// Unhandled Promise Rejection: We will make the server crash if database is not connected. This function will replace the catch block of database. We will not use the catch block because if we used that then it won't be called unhandled it will be handle then
process.on("unhandledRejection", (error) => {
  console.log(`Error:${error.message}`);
  console.log("Shutting down the server due to Unhandled Promise Rejection");

  // shutting the server and exiting from the process
  server.close(() => {
    process.exit(1);
  });
});
