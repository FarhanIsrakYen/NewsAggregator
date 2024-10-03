import { processArticles } from "../services/articleService.js";
import logger from "./logger.js";

export const processArticlesInBackground = async (articles) => {
    try {
        await processArticles(articles);
    } catch (error) {
        logger.error(`Error processing articles: ${error.message}`);
    }
};