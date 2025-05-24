require('dotenv').config();
import mongoose from "mongoose";


const MONGO = process.env.MONGO_URL;
if (!MONGO) {
  throw new Error("JWT_SECRET is not defined in the environment variables")
}

mongoose.connect(
     MONGO
);

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
});

const contentTypes = ["article", "youtube", "tweet", "document"];
const contentSchema = new mongoose.Schema({
  link: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, enum: contentTypes, required: true },
  tags: [{ type: mongoose.Schema.ObjectId, ref: "Tag" }],
  userId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
});

const tagSchema = new mongoose.Schema({
  title: { type: String, unique: true },
});

const linkSchema = new mongoose.Schema({
  hash: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.ObjectId, ref: "User" },
});

export const userModel = mongoose.model("User", userSchema);
export const contentModel = mongoose.model("Content", contentSchema);
export const tagModel = mongoose.model("Tag", tagSchema);
export const linkModel = mongoose.model("link", linkSchema);
