import { Router } from "express";
import { getTreeData, deleteTree } from "../controllers/treeController";

const treesRouter: Router = Router(); 

treesRouter.get("/trees/:treeId", getTreeData);

treesRouter.delete("/trees/:treeId", deleteTree);

export default treesRouter;
