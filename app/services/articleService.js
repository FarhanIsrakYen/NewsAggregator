import { KEYWORDS } from "../configs/config.js";
import { Article } from "../models/ArticleModel.js";
import logger from "../utilities/logger.js";
import RSSParser from 'rss-parser';

const parser = new RSSParser();

const fetchFeed = async (url, failedUrls) => {
    try {
        const feed = await parser.parseURL(url);
        return feed.items.map(({ title, content: description, pubDate, link: sourceUrl }) => ({
            title,
            description,
            pubDate: new Date(pubDate),
            sourceUrl
        }));
    } catch (error) {
        console.error(`Error fetching feed from ${url}:`, error.message);
        failedUrls.push({ url, error: error.message });
        return [];
    }
};

export const fetchAllFeeds = async (urls) => {
    const failedUrls = [];
    const promises = urls.map(url => fetchFeed(url, failedUrls));
    const results = await Promise.all(promises);
    return {
        articles: results.flat(),
        failedUrls
    };
};

const saveArticles = async(articles) => {
    try {
        for (const article of articles) {
            await Article.updateOne(
                { title: article.title },
                { $setOnInsert: article },
                { upsert: true }
            );
        }
    } catch (error) {
        logger.error(`Error saving articles: ${error.message}`);
        throw new Error('Error saving articles');
    }
}

function extractTopics(text) {
    const foundTopics = [];
    for (const [key, values] of Object.entries(KEYWORDS)) {
        values.forEach(value => {
            if (text.includes(value)) {
                foundTopics.push({ key, value });
            }
        });
    }
    return foundTopics;
}

export const processArticles = async(articles) => {
    const processedArticles = articles.map(article => {
        const topics = extractTopics(article.description);
        return { ...article, topics };
    });

    await saveArticles(processedArticles);
}

export const filterArticles = async (req) => {
    const { keywords, startDate, endDate } = req.query;

    try {
        const query = {};
        if (keywords) {
            const keywordArray = keywords.split(',').map(kw => kw.trim());
            query.$or = [
                { title: { $in: keywordArray.map(kw => new RegExp(kw, 'i')) } },
                {
                    topics: {
                        $elemMatch: {
                            value: { $in: keywordArray.map(kw => new RegExp(kw, 'i')) }
                        }
                    }
                }
            ];
        }

        if (startDate || endDate) {
            query.pubDate = {};
            if (startDate) {
                query.pubDate.$gte = new Date(startDate);
            }
            if (endDate) {
                const endDateObj = new Date(endDate);
                endDateObj.setHours(23, 59, 59, 999);
                query.pubDate.$lte = new Date(endDateObj.getTime() - endDateObj.getTimezoneOffset() * 60000);
            }
        }

        const articles = await Article.find(query);
        return {status: 200, message: 'Data retrieved successfully', data: articles};
    } catch (err) {
        logger.error(`Error filtering articles: ${err.message}`);
        return {status: 400, message: 'Something went wrong. Please try again'};
    }
};