"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new Error("secret missing in .env");
}
const UserMiddleware = (req, res, next) => {
    const header = req.headers["authorization"];
    if (!header) {
        res.status(401).json({ message: "Authorization header is missing" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(header, secret);
        req.userId = decoded.id;
        next();
    }
    catch (err) {
        res.status(403).json({ message: "You are not logged in" });
    }
};
exports.UserMiddleware = UserMiddleware;
