import { Application } from "express";

import { Post } from "./interfaces";
import { Models } from "./models";
import { checkToken, postsPerPage } from "./utils";

export default (app: Application) => {
    app.post("/posts", checkToken, async (req, res, next) => {
        try {
            let postData: Partial<Post> = req.body;
            postData.user_id = res.locals.user_id;
            postData.parent_id = undefined;
            postData.title = req.body.title || "";
            postData.text = req.body.text || "";

            let post = new Models.Post(postData);
            try {
                await post.validate();
            } catch (e) {
                return res.status(400).json({error: "Bad post details."});
            }

            await post.save(function (err) {
                if (err) {
                    return res.status(500).json({error: "Internal server error."});
                } else {
                    res.status(200).json({ok: true, id: post._id});
                }
            });
        } catch (e) {
            next(e);
        }
    });

    app.post("/posts/:post", checkToken, async (req, res, next) => {
        try {
            let postData: Partial<Post> = req.body;
            postData.user_id = res.locals.user_id;
            postData.parent_id = req.params.post;
            postData.title = req.body.title || "";
            postData.text = req.body.text || "";

            let post = new Models.Post(postData);
            try {
                await post.validate();
            } catch (e) {
                return res.status(400).json({error: "Bad post details."});
            }

            await post.save(function (err) {
                if (err) {
                    return res.status(500).json({error: "Internal server error."});
                } else {
                    res.status(200).json({ok: true, id: post._id});
                }
            });
        } catch (e) {
            next(e);
        }
    });

    app.get("/posts/:post", async (req, res, next) => {
        try {
            Models.Post.findOne({_id: req.params.post}).lean().exec(async function (err, post) {
                if (err) res.status(500).json({error: "Internal server error."});
                if (!post) res.status(404).json({error: "Post not found."});
                let userName = await Models.User.findOne({_id: post.user_id});
                post.user = userName ? userName.user : -1;
                return res.json(post);
            });
        } catch (e) {
            next(e);
        }
    });

    app.patch("/posts/:post", checkToken, async (req, res, next) => {
        try {
            Models.Post.findOne({_id: req.params.post}, "user_id").then(async function (post) {
                if (post == null) return res.status(404).json({error: "Post not found."});
                if (res.locals.user_id != post.user_id) return res.status(400).json({error: "Invalid token, not original submitter."});
                
                if (req.body.title) post.title = req.body.title;
                if (req.body.text) post.text = req.body.text;
                await post.save(function (err) {
                    if (err) {
                        return res.status(500).json({error: "Internal server error."});
                    } else {
                        res.status(200).json({ok: true, id: post._id});
                    }
                });
            });
        } catch (e) {
            next(e);
        }
    });

    app.delete("/posts/:post", checkToken, async (req, res, next) => {
        try {
            Models.Post.findOne({_id: req.params.post}, "user_id").then(function (post) {
                if (post == null) return res.status(404).json({error: "Post not found."});
                if (res.locals.user_id != post.user_id) return res.status(400).json({error: "Invalid token for post submitter."});

                Models.Post.deleteOne({_id: req.params.post}).then(function (result) {
                    if (result.ok) {
                        res.status(200).json({ok: true});
                    } else {
                        res.status(500).json({error: "Internal server error."});
                    }
                });
            });
        } catch (e) {
            next(e);
        }
    });

    app.get("/posts/:post/replies/:page?", async (req, res, next) => {
        try {
            let result = {length: 0, pages: 0, posts: []}
            result.length = await Models.Post.countDocuments({parent_id: req.params.post});
            result.pages = Math.floor((result.length + postsPerPage - 1) / postsPerPage);
            let start_post = req.params.page ? req.params.page * postsPerPage : 0;
            const posts = await Models.Post.find({parent_id: req.params.post}).sort({_id: -1}).limit(postsPerPage).skip(start_post).lean();
            for (let i = 0; i < posts.length; i++) {
                let userName = await Models.User.findOne({_id: posts[i].user_id});
                posts[i].user = userName ? userName.user : -1;   
            }
            result.posts = posts;
            return posts ? res.json(result) : res.status(404).json({error: "No posts found."});
        } catch (e) {
            next(e);
        }
    });
};