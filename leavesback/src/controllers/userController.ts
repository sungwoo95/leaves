import { User } from '../types';
import { Request, Response } from 'express';
import { usersCollection } from '../config/db';

const createUser = (sub: string): User => {
  return {
    sub,
    myForests: [],
    treeId: undefined,
    leafId: undefined,
  };
};

export const readMainPageData = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) { res.status(401).json({ message: '[userController][readMainPageData]Unauthorized' }); return; }
  const sub = req.user.sub;
  try {
    const mainPageData = await usersCollection.findOne({ sub }, { projection: { _id: 0, sub: 0 } });
    if (!mainPageData) {
      const newUser = createUser(sub);
      await usersCollection.insertOne(newUser);
      // sub 필드 제거
      const { sub: _, ...mainPageData } = newUser;
      res.json(mainPageData);
      return;
    }
    res.json(mainPageData);
  } catch (error) {
    console.log("[userController][readMainPageData]error: ", error);
    res.status(500).json({ message: '[userController][readMainPageData]Internal server error', error });
  }
};

export const postMainPageData = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) { res.status(401).json({ message: '[userController][readMainPageData]Unauthorized' }); return; }
  const sub = req.user.sub;
  const { treeId, leafId } = req.body;
  try {
    const document = await usersCollection.updateOne(
      { sub },
      { $set: { treeId, leafId } }
    );
    if (document.matchedCount === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (document.modifiedCount === 0) {
      res.status(200).json({ message: 'No changes made' });
      return;
    }
    res.status(200).json({ message: 'Update successful' });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
