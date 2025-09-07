import { config } from 'dotenv';
config();

const os = Object.assign({}, process.env);

export default {
    name: os.APP_NAME || 'crypto-portfolio-management-system',
   
    domain: {
        user: {
            api: os.APP_DOMAIN_API || 'http://localhost:3000',
        },
    },
    
    jwt: {
        secret: os.APP_SECRET || 'insecure@1bug.com',
        expiry: os.JWT_EXPIRY || '1d' || 3,
    },

    port: Number(os.PORT) || 3000,

    deploymentEnv: os.NODE_ENV || 'development',

    database: {
        redis: {
            port: Number(os.REDIS_PORT) || 6379,
            host: os.REDIS_HOST || 'xxxx',
            username: os.REDIS_USER || 'localhost',
            password: os.REDIS_PASSWORD || 'password',
            url: `redis://${os.REDIS_USER}:${os.REDIS_PASSWORD}@${os.REDIS_HOST}:${Number(os.REDIS_PORT)}`,
            ssl: { rejectUnauthorized: true }
        },
        postgresql: {
            user: os.PG_USER || 'user',
            password: os.PG_PASSWORD || 'password',
            host: os.PG_HOST || 'localhost',
            port: Number(os.PG_PORT) || 5432,
            database: os.PG_DATABASE || 'typescript-graphql-api-template',
            uri: `postgresql://${os.PG_USER}:${os.PG_PASSWORD}@${os.PG_HOST}:${Number(os.PG_PORT)}/${os.PG_DATABASE}`,
        },
    },
    
    mail: {
        host: os.MAIL_HOST || 'smtp.mailtrap.io',
        port: Number(os.MAIL_PORT) || 2525,
        secure: os.MAIL_SECURE === 'true' || false,
        auth: {
            user: os.MAIL_USER || 'user',
            pass: os.MAIL_PASSWORD || 'password',
        },
        from: os.MAIL_FROM || 'support@crypto-management-system',
        name: os.MAIL_NAME || 'crypto-management-system',
        template: {
            riskAlert: {
                subject: `🚨 Portfolio Risk Alert`,
                html: `
                  <p>Hello {{firstName}},</p>
                  <p>We detected unusual activity in your portfolio <strong>{{portfolioName}}</strong>.</p>
                  <p><strong>Alert:</strong> {{alertMessage}}</p>
                  <p>Current Value: <strong>{{currentValue}}</strong></p>
                  <p>Threshold Breached: <strong>{{threshold}}</strong></p>
                  <p>Please review your positions immediately in the dashboard.</p>
                  <p>Stay safe,<br/>Portfolio Risk Management System</p>
                `
            },
        },
    },
};
