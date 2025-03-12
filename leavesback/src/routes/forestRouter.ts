import { Router } from "express";
import { createForest, readForest } from "../controllers/forestController";


const forestRouter: Router = Router();

forestRouter.post("/createForest", createForest);
forestRouter.get("/readForest/:forestId", readForest);

export default forestRouter;
