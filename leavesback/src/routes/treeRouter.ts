import { Router } from "express";
import { getTreeData, deleteTree } from "../controllers/treeController";

const treeRouter: Router = Router(); 

treeRouter.get("/:treeId", getTreeData);

treeRouter.delete("/:treeId", deleteTree);

export default treeRouter;
