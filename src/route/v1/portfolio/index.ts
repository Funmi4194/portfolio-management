import { Router } from 'express';
import validator from '../../../validator/validator';
import * as controller from '../../../controller/base';
import * as portfoliovalidator from '../../../validator/portfolio/portfolio';
import * as portfoliologic from '../../../logic/portfolio/portfolio';
import { authenticate } from '../../../middleware/authenticate';

const router = Router();

router.post('/portfolios',
    authenticate(['authorization']),
    validator(portfoliovalidator.createPortfolio, { body: true }, true), 
    controller.create(portfoliologic.CreatePortfolio), 
);
router.get('/portfolios/:userId',
    // authenticate(['authorization']),
    validator(portfoliovalidator.Portfolio, { params: true }, true), 
    controller.create(portfoliologic.Portfolio), 
);


export default (app: Router) => app.use('/api', router);
