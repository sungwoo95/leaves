import { Router } from "express";
import { readDirectories, updateDirectories } from "../controllers/userController";


const userRouter: Router = Router(); 

userRouter.get("/user/directories",readDirectories);
userRouter.post("/user/directories",updateDirectories);

export default userRouter;