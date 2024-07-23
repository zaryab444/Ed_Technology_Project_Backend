const express = require('express');
const dotenv = require('dotenv');
const connectDB = require("./Config/db");

const userRoutes = require("./Routes/userRoutes");

dotenv.config();

connectDB();

const app = express();

//body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api/users", userRoutes);

app.use("/public/uploads", express.static(__dirname + "/public/uploads"));

const PORT = process.env.PORT || 5000

app.listen(
    PORT,
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)