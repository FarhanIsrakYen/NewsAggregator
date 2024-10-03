import express from "express";
import * as ArticleController from "../app/controllers/ArticleController.js";
const router = express.Router();

router.get('/articles/fetch', ArticleController.fetchAndStoreArticles);
router.get('/articles', ArticleController.getArticles);

export default router;