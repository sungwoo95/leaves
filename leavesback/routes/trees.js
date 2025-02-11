import { Router } from "express";
import { getTreeData, deleteTree } from "../controllers/treeController.js";

const treesRouter = Router();

treesRouter.get("/trees/:treeId", getTreeData);

treesRouter.delete("/trees/:treeId", deleteTree);

export default treesRouter;
