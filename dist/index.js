"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const zod_1 = __importDefault(require("zod"));
const db_1 = require("./db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const middleware_1 = require("./middleware");
const util_1 = require("./util");
const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new Error("JWT_SECRET is not defined in the environment variables");
}
const app = (0, express_1.default)();
app.use(express_1.default.json());
const SignupInput = zod_1.default.object({
    name: zod_1.default.string().min(3).max(10),
    username: zod_1.default.string().min(3).max(20).email(),
    password: zod_1.default.string().min(5).max(20),
});
const SigninInput = zod_1.default.object({
    username: zod_1.default.string().min(3).max(20).email(),
    password: zod_1.default.string().min(5).max(20),
});
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedData = SignupInput.safeParse(req.body);
        if (!parsedData.success) {
            res.status(411).json({
                message: "Error in inputs",
            });
            return;
        }
        const { name, username, password } = parsedData.data;
        yield db_1.userModel.create({
            name: name,
            username: username,
            password: password,
        });
        res.status(200).json({
            message: "Signed up",
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Server Error",
        });
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedData = SigninInput.safeParse(req.body);
        if (!parsedData.success) {
            res.status(411).json({
                message: "Error in inputs"
            });
            return;
        }
        const { username, password } = parsedData.data;
        const response = yield db_1.userModel.findOne({
            username,
            password
        });
        console.log(response);
        if (!response) {
            res.status(404).json({
                message: "Not Signed up"
            });
            return;
        }
        else {
            const token = jsonwebtoken_1.default.sign({
                id: response._id
            }, secret);
            res.status(200).json({
                token: token
            });
        }
    }
    catch (e) {
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}));
app.post("/api/v1/content", middleware_1.UserMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { link, title, type } = req.body;
    if (!link || !title || !type) {
        res.status(404).json({
            message: "contents fields are missing"
        });
        return;
    }
    yield db_1.contentModel.create({
        link: link,
        title: title,
        type: type,
        tags: [],
        userId: req.userId
    });
    res.status(200).json({
        message: "Content created successfully"
    });
}));
app.get("/api/v1/content", middleware_1.UserMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const content = yield db_1.contentModel.findOne({
        userId
    }).populate("userId", "username");
    res.status(200).json({
        content
    });
}));
app.delete("/api/v1/content", middleware_1.UserMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.body.contentId;
    const response = yield db_1.contentModel.deleteOne({
        _id: contentId,
        userId: req.userId
    });
    if (!response) {
        res.status(403).json({
            message: "you are not the author of this content"
        });
        return;
    }
    res.status(200).json({
        message: "content deleted",
    });
}));
app.post("/api/v1/brain/share", middleware_1.UserMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const share = req.body.share;
    if (share) {
        const shareLink = (0, util_1.hash)(10);
        yield db_1.linkModel.create({
            hash: shareLink,
            userId: req.userId
        });
        res.status(200).json({
            message: "Share link created",
            shareLink
        });
    }
    else {
        yield db_1.linkModel.deleteOne({
            userId: req.userId
        });
        res.status(201).json({
            message: "ShareLink is disabled",
        });
    }
}));
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shareLink = req.params.shareLink;
        // Find the user associated with this share link
        const linkDoc = yield db_1.linkModel.findOne({
            hash: shareLink
        });
        if (!linkDoc) {
            res.status(404).json({
                message: "Share link not found or expired"
            });
            return;
        }
        // Find all content for this user
        const content = yield db_1.contentModel.find({
            userId: linkDoc.userId
        }).populate("userId", "username");
        res.status(200).json({
            content
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
}));
app.listen(8080);
