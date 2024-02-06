const express = require("express");
const mongoose = require("mongoose");
const methodRoutes = require("./Method/methods");

const app = express();
const port = 3000;

app.use(express.json());
app.use(methodRoutes);

app.listen(port, async () => {
    try {
        await mongoose.connect("mongodb://0.0.0.0:27017/studentdata");
        console.log(`Listening on port number: ${port}`);
    } catch (error) {
        console.error("Mongoose connection error", error);
    }
});
