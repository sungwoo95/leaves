import { Router } from "express";
import { readDirectories, readForests, updateDirectories, userStart } from "../controllers/userController";


const userRouter: Router = Router(); 
//auth
userRouter.post("/start", userStart);
//directoreis
userRouter.get("/directories",readDirectories);
userRouter.post("/directories",updateDirectories);
//forests
userRouter.get("/forests",readForests);

export default userRouter;