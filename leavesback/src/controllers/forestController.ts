import { Request, Response } from "express";
import { parseAccessToken } from "./userController";
import { forestsCollection, usersCollection } from "../config/db";
import { Forest, MyForestInfo } from "../types";
import { ObjectId } from "mongodb";

export const createForest = async (req: Request, res: Response): Promise<void> => {
  const forestName = req.body.forestName;
  console.log(forestName);
  const cookies = req.cookies;
  if (!cookies) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }
  const accessToken = cookies.access_token;
  const userObjectId = parseAccessToken(accessToken, res);
  if (!userObjectId) {
    return;
  }
  try {
    const newForest: Forest = {
      name: forestName,
      directories: [],
      participants: [],
    }
    const newForestObjectId: ObjectId = (await forestsCollection.insertOne(newForest)).insertedId;
    const newMyForestInfo: MyForestInfo = {
      forestId: newForestObjectId,
      isOwner: true,
    }
    await usersCollection.updateOne(
      { _id: userObjectId },
      { $push: { myForests: newMyForestInfo } }
    );
    res.status(201).json({
      message: "Forest created successfully",
      newMyForestInfo,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

export const readForest = async (req: Request, res: Response): Promise<void> => {
  const { forestId } = req.params;
  const objectId = new ObjectId(forestId);
  try {
    const forest: Forest | null = await forestsCollection.findOne({ _id: objectId });
    if (!forest) {
      console.log("Forest not found");
      res.status(404).json({ message: "Forest not found" });
      return;
    }
    const directories = forest.directories;
    res.json(directories);
  } catch (error) {
    console.log("[forestController]readForest Error");
    res.status(500).json({ message: "internal error" });
  }
}