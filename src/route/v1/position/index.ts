import { Router } from 'express';
import validator from '../../../validator/validator';
import * as controller from '../../../controller/base';
import * as positionvalidator from '../../../validator/position/position';
import * as positionlogic from '../../../logic/position/position';
import { authenticate } from '../../../middleware/authenticate';
import { userRepository } from '../../../repository/user';

const router = Router();

router.post('/portfolios/:portfolioId/positions',
    authenticate(['authorization']),
    validator(positionvalidator.positionPortfolio, { params: true }, true), 
    validator(positionvalidator.createPosition, { body: true }, true), 
    controller.create(positionlogic.CreatePosition), 
);


export default (app: Router) => app.use('/api', router);
