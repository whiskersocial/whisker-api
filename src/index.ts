import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authEndpoints from "./auth";
import postEndpoints from "./posts";
import userEndpoints from "./users";

mongoose.connect(process.env.MONGO_URL || "");

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

[
    authEndpoints,
    postEndpoints,
    userEndpoints
].forEach(fn => fn(app));

app.listen(process.env.PORT || 5000);