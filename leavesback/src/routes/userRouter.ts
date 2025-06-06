import { Router } from 'express';
import {
  deleteUser,
  postMainPageData,
  readMainPageData,
} from '../controllers/userController';

const userRouter: Router = Router();
//mainPage
userRouter.get('/mainPage', readMainPageData);
userRouter.post('/mainPage', postMainPageData);
userRouter.delete('/deleteUser', deleteUser);

export default userRouter;
