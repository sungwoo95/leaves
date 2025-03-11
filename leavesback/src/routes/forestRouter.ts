import { Router } from "express";
import { createForest } from "../controllers/forestController";


const forestRouter: Router = Router(); 

forestRouter.post("/createForest", createForest);

export default forestRouter;
