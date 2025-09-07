import { Router } from 'express';

// import portfolio from './portfolio';

const router = Router();

// auth(router);


export default (app: Router) => app.use('/user', router);
