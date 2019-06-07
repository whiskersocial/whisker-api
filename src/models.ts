import { model, Schema, Document } from "mongoose";

import { User, Post } from "./interfaces";

export interface UserModel extends Document, User {};
export interface PostModel extends Document, Post {};

export namespace Models {
    export const User = model<UserModel>("User", new Schema({
        user: {type: String, required: true, unique: true},
        pass: {type: String, required: true}
    }));

    export const Post = model<PostModel>("Post", new Schema({
        user_id: {type: String, required: true},
        title: String,
        parent_id: String,
        text: String
    }, {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }));
}