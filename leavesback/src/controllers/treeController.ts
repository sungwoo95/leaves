import { Request, Response } from "express";
import { Leaf, Tree } from "../types";
import { leavesCollection, treesCollection } from "../config/db";
import { ObjectId } from "mongodb";

const treeData: Record<string, Tree> = {
  "1": {
    nodes: [
      { data: { id: "root", label: "Root Node" }, position: { x: 300, y: 50 } },
      { data: { id: "child1", label: "Child Node 1" }, position: { x: 200, y: 200 } },
      { data: { id: "child2", label: "Child Node 2" }, position: { x: 400, y: 200 } },
    ],
    edges: [
      { data: { source: "root", target: "child1", label: "Edge to Child 1" } },
      { data: { source: "root", target: "child2", label: "Edge to Child 2" } },
    ],
  },
};

//특정 트리 데이터 조회 (GET /tree/:treeId)
export const readTree = async (req: Request, res: Response): Promise<void> => {
  const { treeId } = req.params;
  console.log("[treeController][readTree]treeId:", treeId);
  try {
    const tree = await treesCollection.findOne({
      _id: new ObjectId(treeId)
    })
    res.json(tree);
  } catch (error) {
    console.log("[treeController][readTree]find Tree error");
    res.status(500).json({ message: "internal server error" });
  }
};

//db에 새로운 Tree inserOne하기, objectId 응답하기.
export const createTree = async (req: Request, res: Response): Promise<void> => {
  try {
    const newLeaf: Leaf = {
      title: "Untitled",
      contents: "",
    }
    const insertLeafResult = await leavesCollection.insertOne(newLeaf);
    if (!insertLeafResult.acknowledged) {
      console.log("[TreeController][createTree]insert new leaf error")
      res.status(500).json({ message: "Internal server error" });
      return;
    }
    const leafId = insertLeafResult.insertedId;
    const newTree: Tree = {
      nodes: [{ data: { id: leafId.toString(), label: "Untitled" }, position: { x: 300, y: 50 } },],
      edges: [],
    }
    const insertTreeResult = await treesCollection.insertOne(newTree);
    if (!insertTreeResult.acknowledged) {
      console.log("[TreeController][createTree]insert new Tree error")
      res.status(500).json({ message: "Internal server error" });
      return;
    }
    const treeId = insertTreeResult.insertedId;
    const updateLeafResult = await leavesCollection.updateOne({ _id: leafId }, { $set: { owningTreeId: treeId.toString() } })
    if (updateLeafResult.modifiedCount === 0) {
      console.log("[TreeController][createTree] update leaf owningTreeId error");
      res.status(500).json({ message: "Failed to update leaf owningTreeId" });
      return;
    }
    res.json({ treeId });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

