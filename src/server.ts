import env from './config/env';
import { logan, logger } from './garage/log/logger';
import express, { Application } from 'express';
import * as postgresql from './database/postgresql';
import cors from 'cors';
import helmet from "helmet";
import * as redis from './database/redis';
import http, { Server } from 'http';
import handleRouting from './routing';
// import * as indexes from './database/indexes';


export default async function startApplication(app: Application): Promise<void> {
    app.use(express.urlencoded({ extended: true }));
    app.set('trust proxy', true);  
    app.use(express.json());
    app.use(express.raw());
    app.use(cors());
    app.use(helmet())

    app.use(logan);

    await postgresql.openConnection();

    await redis.createConnection();


    const httpServer = http.createServer(app);

    //  Start listening
    httpServer.listen(env.port, () => {
        console.log(`🚀 server running on http://localhost:${env.port}`);
        console.log(`📡 WS server running on ws://localhost:${env.port}/ws`);
    });

    handleRouting(app);
}