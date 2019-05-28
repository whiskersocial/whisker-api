import { Application } from "express";
import { hash } from "bcrypt";

import { User } from "./interfaces";
import { Models } from "./models";
import { genToken, checkToken } from "./utils";

export default (app: Application) => {
    app.post("/users", async (req, res, next) => {
        try {
            let userData: Partial<User> = req.body;
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
                    res.status(200).json({ok: true, token: genToken(req.body.user, req.body.jwt_exp || "2h")});
                }
            });
        } catch (e) {
            next(e);
        }
    });

    app.delete("/users/:user", checkToken, async (req, res, next) => {
        try {
            if (res.locals.user != req.params.user) {
                return res.status(400).json({error: "Invalid token for user: " + req.params.user + "."});
            }

            const result = await Models.User.deleteOne({user: res.locals.user});
            if (result.ok) {
                res.status(200).json({ok: true});
            } else {
                res.status(500).json({error: "Internal server error."});
            }
        } catch (e) {
            next(e);
        }
    });
};