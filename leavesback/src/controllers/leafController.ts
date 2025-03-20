import { Request, Response } from "express";
import { leavesCollection } from "../config/db";
import { ObjectId } from "mongodb";

export const readLeaf = async (req: Request, res: Response): Promise<void> => {
  const { leafId } = req.params;
  try {
    const leaf = await leavesCollection.findOne({
      _id: new ObjectId(leafId)
    })
    res.json(leaf);
  } catch (error) {
    console.log("[leafController][readLeaf]find Leaf error");
    res.status(500).json({ message: "internal server error" });
  }
};