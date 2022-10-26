require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const swaggerAutogen = require("swagger-autogen")();

const defineRoute = require("./routes/index");
const db = require("./configs/database");

const app = express();

// Connect to database
db.connect();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "client")));

const outputFile = "./services/swagger_output.json";
const endpointsFiles = ["./routes/api.js"];
const doc = {
    info: {
        title: "Store System Rest API",
    },
    host: `localhost:${process.env.PORT}/api/v1`,
};
swaggerAutogen(outputFile, endpointsFiles, doc);

// Define routes end point
defineRoute(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500).json({
        status: false,
        statusCode: err.status || 500,
        msg: {
            en: err.message,
        },
    });
});

module.exports = app;
