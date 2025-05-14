import mongoose from "mongoose";

mongoose.connect(
  "mongodb+srv://vkrao800:raovk2004@cluster0.hhav2xg.mongodb.net/brainly"
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
