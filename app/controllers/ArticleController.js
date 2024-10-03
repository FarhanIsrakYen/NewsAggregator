import {fetchAllFeeds, filterArticles} from "../services/articleService.js";
import { RSS_FEEDS } from "../configs/config.js";
import { processArticlesInBackground } from "../utilities/articleProcessor.js";
import logger from "../utilities/logger.js";

export const fetchAndStoreArticles = async (req, res) => {
    if (RSS_FEEDS.length === 0) {
        return res.status(404).json({ message: 'No RSS feed URLs configured.' });
    }
    try {
        const { articles, failedUrls } = await fetchAllFeeds(RSS_FEEDS);
        processArticlesInBackground(articles);

        return res.json({
            failedUrls,
            message: failedUrls.length ? 'Some feeds failed to load. Rest was successful' :
                'All feeds loaded successfully.'
        });
    } catch (error) {
        logger.error(`Error fetching and storing articles: ${error.message}`);
        return res.status(400).json({ message: 'Something went wrong. Please try again' });
    }
}

export const getArticles = async (req, res) => {
    const articles = await filterArticles(req);
    return res.json(articles);
}
