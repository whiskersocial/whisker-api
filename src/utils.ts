import { sign, verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const genToken = (user: String, expiration: string) => {
    return sign({user: user}, process.env.JWT_SECRET || "", {expiresIn: expiration});
}

export const checkToken = (req: Request, res: Response, next: NextFunction) => {
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
        res.locals.user = verification.user;
        next();
    } catch (e) {
        return res.status(401).json({error: "Invalid token."});
    }
}

interface Verification {
    user: string;
}