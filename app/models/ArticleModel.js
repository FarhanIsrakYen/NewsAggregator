import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    pubDate: { type: Date, required: true },
    sourceUrl: { type: String, required: true },
    topics: [{ key: String, value: String }],
})

export const Article = mongoose.model("Article", articleSchema);