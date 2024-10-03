import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import router from "./routes/api.js";
import {
    DATABASE,
    MAX_JSON_SIZE, PORT,
    REQUEST_LIMIT_TIME,
    REQUEST_NUMBER, URL_ENCODE,
    WEB_CACHE
} from './app/configs/config.js';
import rateLimit from "express-rate-limit";
import {startCronJob} from "./app/utilities/scheduler.js";

const app = express();

app.use(express.json({limit: MAX_JSON_SIZE}));
app.use(express.urlencoded({ extended: URL_ENCODE }));
app.use(helmet());


const limiter = rateLimit({windowMs:REQUEST_LIMIT_TIME, max: REQUEST_NUMBER})
app.use(limiter)


app.set('etag', WEB_CACHE)

mongoose.connect(DATABASE, {autoIndex:true}).then(()=> {
    console.log("DB connected")
}).catch(() => {
    console.log("DB disconnected")
})

startCronJob();

app.use('/api', router)

app.listen(PORT, () =>{
    console.log("Server started")
})