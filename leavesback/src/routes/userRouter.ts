import { Router } from "express";
import { getDirectories, postDirectories } from "../controllers/userController";

const userRouter: Router = Router(); 

userRouter.get("/user/directories",getDirectories);
userRouter.post("/user/directories",postDirectories);

export default userRouter;