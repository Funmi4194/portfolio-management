declare global {
    namespace NodeJS {
        interface ProcessEnv {
            APP_SECRET: string;
            APP_NAME: string;
            PORT: number;
            PG_HOST: string;
            PG_PORT: number;
            PG_DATABASE: string;
            PG_USER: string;
            PG_PASSWORD: string;
            NODE_ENV: string;
            JWT_EXPIRY: string;
            REDIS_PORT: string;
            REDIS_HOST: string;
            REDIS_USER: string;
            REDIS_PASSWORD: string;
        }
    }
}