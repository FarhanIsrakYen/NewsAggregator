import cron from 'cron';
import { fetchAllFeeds } from "../services/articleService.js";
import { RSS_FEEDS, SCHEDULED_INTERVAL } from "../configs/config.js";
import logger from "./logger.js";
import { processArticlesInBackground } from "./articleProcessor.js";

const CronJob = cron.CronJob;

export const startCronJob = () => {
    if (!RSS_FEEDS.length) {
        logger.error('No RSS feed URLs configured. Article fetching job will not start.');
        return;
    }

    const job = new CronJob(SCHEDULED_INTERVAL, async () => {
        logger.info('Article fetching started successfully');
        try {
            const { articles, failedUrls } = await fetchAllFeeds(RSS_FEEDS);
            processArticlesInBackground(articles);
            if (failedUrls.length) {
                logger.error(`Some feeds failed to load: ${failedUrls.map(f => f.url).join(', ')}`);
            }
        } catch (error) {
            logger.error(`Error in scheduled task: ${error.message}`);
        }
    });

    job.start();
};
