import { Router } from 'express';

import user from './user';
import portfolio from './portfolio';
import position from './position';
import transaction from './transaction';


export default (router: Router) => {
    user(router);
    portfolio(router);
    position(router)
    transaction(router)
};
