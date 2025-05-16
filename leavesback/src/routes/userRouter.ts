import { Router } from 'express';
import {
  postMainPageData,
  readMainPageData,
} from '../controllers/userController';

const userRouter: Router = Router();
//mainPage
userRouter.get('/mainPage', readMainPageData);
userRouter.post('/mainPage', postMainPageData);

export default userRouter;
