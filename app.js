const express = require("express");
const cors = require("cors");

const app = express();

const cookieParser = require("cookie-parser");

const errorMiddleware = require("./middleware/error");

const bodyParser = require("body-parser");

const fileUplaod = require("express-fileupload");
// middleware
app.use(express.json());
app.use(cookieParser());
app.use(fileUplaod());
app.use(bodyParser.urlencoded({ extended: true }));

// Route imports
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const theme = require("./routes/themeRoute");
const category = require("./routes/categoryRoute");

// const order = require("./routes/orderRoute");
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from frontend
    credentials: true, // Allow sending cookies
  })
);

// It acts as a middleware. Middleware is a function having access to request and response and can modify any request or response
// .use is a method to add middlewares
app.use("/en", product);
app.use("/en", category);
app.use("/en", user);
app.use("/en", theme);
// app.use("/api/v1",order)

// using errorHander Middleware here
app.use(errorMiddleware);

module.exports = app;
