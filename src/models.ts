import { model, Schema, Document } from "mongoose";

import { User } from "./interfaces";

export interface UserModel extends Document, User {};

export namespace Models {
    export const User = model<UserModel>("User", new Schema({
        user: {type: String, required: true, unique: true},
        pass: {type: String, required: true}
    }));
}