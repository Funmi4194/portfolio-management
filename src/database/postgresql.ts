import pg from 'pg'
import env from '../config/env'
import { logger } from '../garage/log/logger'
import path = require('path');
import { read } from '../garage/helper/filesystem';

export let Pool: pg.Pool;

export async function openConnection(): Promise<void> {
    Pool = new pg.Pool({
        connectionString: env.database.postgresql.uri,
        ssl: {
            rejectUnauthorized: false,
        },
    });

    subscribeToConnectionEvents();

    return Pool.connect((error, client, done) => {
        if (error) {
            logger.error('Error connecting to postgresql database: ', error);
        }
    });
}

export function subscribeToConnectionEvents(): void {
    Pool.on('error', async (error) => {
        logger.error('Postgresql database error: ', error);
        await openConnection();
    });

    Pool.on('connect', () => {
        logger.debug('Connected to postgresql database');
    });

    Pool.on('release', () => {
        logger.warn('Postgresql database connection released');
    });
}

export function closeConnection(): Promise<void> {
    return Pool.end();
}

export async function migrate(): Promise<void> {
    logger.debug('[migration] [begin]');

    const query = read(path.join(__dirname, '../migration'));

    const response = await Pool.query(query);

    logger.debug(response);

    logger.debug('[migration] [end] [ok!]');
}
