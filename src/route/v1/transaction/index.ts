import { Router } from 'express';
import validator from '../../../validator/validator';
import * as controller from '../../../controller/base';
import * as txvalidator from '../../../validator/transaction/tx';
import * as txlogic from '../../../logic/transaction/tx';
import { authenticate } from '../../../middleware/authenticate';
import { userRepository } from '../../../repository/user';

const router = Router();

router.post('/transactions',
    authenticate(['authorization']),
    validator(txvalidator.createtx, { body: true }, true), 
    controller.create(txlogic.CreateTx), 
);


export default (app: Router) => app.use('/api', router);
