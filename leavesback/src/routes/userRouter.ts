import { Router } from "express";
import { readDirectories, updateDirectories, userStart } from "../controllers/userController";


const userRouter: Router = Router(); 

userRouter.get("/directories",readDirectories);
userRouter.post("/directories",updateDirectories);
userRouter.post("/start", userStart);

export default userRouter;