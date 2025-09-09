import { Router } from 'express';
import validator from '../../../validator/validator';
import * as controller from '../../../controller/base';
import * as authvalidator from '../../../validator/user/auth';
import * as authlogic from '../../../logic/user/auth';
import { authenticate } from '../../../middleware/authenticate';


const router = Router();

router.post('/signup', validator(authvalidator.signup, { body: true }, true), controller.create(authlogic.signup));
router.get('/signin', 
    validator(authvalidator.signin, { body: true }, true), 
    controller.create(authlogic.signin), 
);

export default (app: Router) => app.use('/user', router);
