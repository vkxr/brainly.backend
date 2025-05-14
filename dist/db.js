"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkModel = exports.tagModel = exports.contentModel = exports.userModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.connect("mongodb+srv://vkrao800:raovk2004@cluster0.hhav2xg.mongodb.net/brainly");
const userSchema = new mongoose_1.default.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
});
const contentTypes = ["article", "youtube", "tweet", "document"];
const contentSchema = new mongoose_1.default.Schema({
    link: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, enum: contentTypes, required: true },
    tags: [{ type: mongoose_1.default.Schema.ObjectId, ref: "Tag" }],
    userId: { type: mongoose_1.default.Schema.ObjectId, ref: "User", required: true },
});
const tagSchema = new mongoose_1.default.Schema({
    title: { type: String, unique: true },
});
const linkSchema = new mongoose_1.default.Schema({
    hash: { type: String, required: true, unique: true },
    userId: { type: mongoose_1.default.Schema.ObjectId, ref: "User" },
});
exports.userModel = mongoose_1.default.model("User", userSchema);
exports.contentModel = mongoose_1.default.model("Content", contentSchema);
exports.tagModel = mongoose_1.default.model("Tag", tagSchema);
exports.linkModel = mongoose_1.default.model("link", linkSchema);
