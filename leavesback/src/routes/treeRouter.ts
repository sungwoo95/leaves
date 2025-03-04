import { Router } from "express";
import { getTreeData, deleteTree } from "../controllers/treeController";

const treeRouter: Router = Router(); 

treeRouter.get("/tree/:treeId", getTreeData);

treeRouter.delete("/tree/:treeId", deleteTree);

export default treeRouter;
