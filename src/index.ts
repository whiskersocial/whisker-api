import "dotenv/config";
import express from "express";
import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_URL || "");

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.listen(process.env.PORT || 5000);