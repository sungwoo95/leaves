import { Router } from "express";
import { readDirectories, readMyForests, updateDirectories, userStart } from "../controllers/userController";


const userRouter: Router = Router(); 
//auth
userRouter.post("/start", userStart);
//directoreis
userRouter.get("/directories",readDirectories);
userRouter.post("/directories",updateDirectories);
//forests
userRouter.get("/myForests",readMyForests);

export default userRouter;