import pg from 'pg'
import env from '../config/env'
import { logger } from '../garage/log/logger'
import path = require('path');
import { read } from '../garage/helper/filesystem';

export let Pool: pg.Pool;
let eventsWired = false;

export async function openConnection(): Promise<void> {
    Pool = new pg.Pool({
        connectionString: env.database.postgresql.uri,
        ssl: {
            rejectUnauthorized: true,
        },
        connectionTimeoutMillis: 10_000,
        max: 10,
        min: 1,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10_000,
    });

    subscribeToConnectionEvents();

    try {
        // test to verify connection is on
        const res = await Pool.query('select 1 as ok');
        logger.debug(`[pg] ready ok=${res.rows?.[0]?.ok}`);
      } catch (error) {
        logger.error('Error connecting to postgresql database:', error);
        throw error;
    }
}

export function subscribeToConnectionEvents(): void {
    if (!Pool || eventsWired) return;
    eventsWired = true;
  
    Pool.on('error', async (error) => {
        logger.error('Postgresql database error: ', error);
    });

    Pool.on('remove', async (error) =>{
        logger.debug('Removed a pg client')
    })

    Pool.on('connect', () => {
        logger.debug('Connected to postgresql database');
    });

    Pool.on('release', () => {
        logger.warn('Postgresql database connection released');
    });
}

export async function closeConnection(): Promise<void> {
    if (Pool) {
      await Pool.end();
      eventsWired = false;
      logger.warn('[pg] pool closed');
    }
}


export async function getPool(): Promise<pg.Pool> {
    if (!Pool) await openConnection();
    return Pool;
}

export async function migrate(): Promise<void> {
    if (!Pool) await openConnection();
    logger.debug('[migration] [begin]');

    const query = read(path.join(process.cwd(), 'migrations'));
    const response = await Pool.query(query);

    logger.debug(response);

    logger.debug('[migration] [end] [ok!]');
}
