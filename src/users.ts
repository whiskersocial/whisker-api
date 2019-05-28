import { Application } from "express";
import { hash } from "bcrypt";

import { User } from "./interfaces";
import { Models } from "./models";
import { genToken, checkToken } from "./utils";

export default (app: Application) => {
    app.post("/users", async (req, res, next) => {
        try {
            let userData: Partial<User> = req.body;
            userData.user = req.body.user || "";
            userData.pass = await hash(req.body.pass, 12);

            let user = new Models.User(userData);
            try {
                await user.validate();
            } catch (e) {
                return res.status(400).json({error: "Bad user details."});
            }

            await user.save(function (err) {
                if (err) {
                    if (err.code == 11000) {
                        return res.status(400).json({error: "User already exists."});
                    }
                    return res.status(500).json({error: "Internal server error."});
                } else {
                    res.status(200).json({ok: true, token: genToken(user._id, req.body.jwt_exp || "2h")});
                }
            });
        } catch (e) {
            next(e);
        }
    });

    app.patch("/users", checkToken, async (req, res, next) => {
        try {
            const user = await Models.User.findOne({_id: res.locals.user_id});
            if (!user) return res.status(404).json({error: "User not found."});

            if (req.body.user) user.user = req.body.user;
            if (req.body.pass) user.pass = await hash(req.body.pass, 12);

            await user.save(function (err) {
                if (err) {
                    if (err.code == 11000) {
                        return res.status(400).json({error: "User with username " + req.body.user + " already exists."});
                    }
                    return res.status(500).json({error: "Internal server error."});
                } else {
                    res.status(200).json({ok: true});
                }
            });
        } catch (e) {
            next(e);
        }
    });

    app.delete("/users", checkToken, async (_, res, next) => {
        try {
            const result = await Models.User.deleteOne({_id: res.locals.user_id});
            if (result.ok) {
                res.status(200).json({ok: true});
            } else {
                res.status(500).json({error: "Internal server error."});
            }
        } catch (e) {
            next(e);
        }
    });

    app.get(["/users/:user", "/userid/:userId"], async (req, res, next) => {
        try {
            let user;
            if (req.params.user) {user = await Models.User.findOne({user: req.params.user}, "-pass");}
            else {user = await Models.User.findOne({_id: req.params.userId}, "-pass");}
            return user ? res.json(user) : res.status(404).json({error: "User not found."});
        } catch (e) {
            next(e);
        }
    });
};