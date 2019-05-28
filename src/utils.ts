import { sign, verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import { Models } from "./models";

export const genToken = (id: String, expiration: string) => {
    return sign({id: id}, process.env.JWT_SECRET || "", {expiresIn: expiration});
}

export const checkToken = async (req: Request, res: Response, next: NextFunction) => {
    let auth = req.get("x-auth-token") || req.get("Authorization");
    if (!auth) {
        return res.status(401).json({error: "Token not provided."});
    }

    if (!auth.startsWith("Bearer ")) {
        return res.status(400).json({error: "Invalid authorization header."});
    }

    let token = auth.slice(7);

    try {
        const verification = verify(token, process.env.JWT_SECRET || "") as Verification;
        await Models.User.findOne({_id: verification.id}, async  function (err, user) {
            if (err) next(err);
            if (user == null) {
                return res.status(404).json({error: "User not found."});
            } else {
                res.locals.user_id = verification.id;
                next();
            }
        });
    } catch (e) {
        return res.status(401).json({error: "Invalid token."});
    }
}

export const getIdFromUser = async (user: string) => {
    let result = "";
    await Models.User.findOne({user: user}, function(_, user) {
        if (user != null) result = user._id;
    });
    return result;
}

export const postsPerPage = 50;

interface Verification {
    id: string;
}