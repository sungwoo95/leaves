import { Router } from "express";
import { postMainPageData, readDirectories, readMainPageData, readMyForests, updateUserDirectories, userStart } from "../controllers/userController";

const userRouter: Router = Router();
//auth
userRouter.post("/start", userStart);
//directoreis
userRouter.get("/directories", readDirectories);
userRouter.post("/directories", updateUserDirectories);
//myForests
userRouter.get("/myForests", readMyForests);
//mainPage
userRouter.get("/mainPage", readMainPageData);
userRouter.post("/mainPage", postMainPageData);

export default userRouter;