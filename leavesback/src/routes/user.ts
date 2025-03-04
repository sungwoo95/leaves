import { Router } from "express";
import { getDirectories } from "../controllers/userController";

const userRouter: Router = Router(); 

userRouter.get("/user/directories",getDirectories);

export default userRouter;