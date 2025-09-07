import { Router } from 'express';

import user from './user';
import portfolio from './portfolio';


export default (router: Router) => {
    user(router);
    portfolio(router);
};
