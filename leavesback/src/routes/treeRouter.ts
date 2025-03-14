import { Router } from "express";
import { createTree, readTree } from "../controllers/treeController";

const treeRouter: Router = Router();

treeRouter.get("/:treeId", readTree);
treeRouter.post("/createTree", createTree);

export default treeRouter;
