import { Router } from "express";
import {
  createForest,
  readForest,
  updateForestDirectories,
} from "../controllers/forestController";

const forestRouter: Router = Router();

forestRouter.post("/createForest", createForest);
forestRouter.get("/readForest/:forestId", readForest);
forestRouter.post("/updateDirectories", updateForestDirectories);

export default forestRouter;
