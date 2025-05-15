import { Router } from 'express';
import {
  postMainPageData,
  readMainPageData,
  readMyForests,
  userStart,
} from '../controllers/userController';

const userRouter: Router = Router();
//auth
userRouter.post('/start', userStart);
//myForests
userRouter.get('/myForests', readMyForests);
//mainPage
userRouter.get('/mainPage', readMainPageData);
userRouter.post('/mainPage', postMainPageData);

export default userRouter;
