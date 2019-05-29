import { Application } from "express";
import { compare } from "bcrypt";

import { Models } from "./models";
import { genToken } from "./utils";

export default (app: Application) => {
    app.post("/login", async (req, res, next) => {
        Models.User.findOne({user: req.body.user}, "pass", async function(err, user) {
            if (err) return next(err);

            if (user == null) {
                return res.status(404).json({error: "User does not exist."});
            }

            if (await compare(req.body.pass, user.pass)) {
                res.status(200).json({ok: true, _id: user._id, token: genToken(user._id, req.body.jwt_exp || "2h")});
            } else {
                return res.status(400).json({error: "Password is incorrect."});
            }
        });
    });
};