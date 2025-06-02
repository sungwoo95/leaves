import { Request, Response } from 'express';
import { leavesCollection } from '../config/db';
import { ObjectId } from 'mongodb';
import liveblocks from '../liveblocks';
import { UserInfo } from '../types';

export const readLeaf = async (req: Request, res: Response): Promise<void> => {
  const { leafId } = req.params;
  try {
    const leaf = await leavesCollection.findOne({
      _id: new ObjectId(leafId),
    });
    if (!leaf) {
      res.status(404).json({ message: 'Leaf not found' });
      return;
    }
    res.json(leaf);
  } catch (error) {
    console.log('[leafController][readLeaf]find Leaf error');
    res.status(500).json({ message: 'internal server error' });
  }
};

export const liveblocksAuth = async (req: Request, res: Response): Promise<void> => {
  const user = req.user
  if (!user) { res.status(401).json({ message: '[userController][readMainPageData]Unauthorized' }); return; }
  const { displayName } = req.body;
  // Start an auth session inside your endpoint
  const userInfo: UserInfo = { name: displayName };
  if (user.picture) {
    userInfo.avatar = user.picture;
  }
  const session = liveblocks.prepareSession(
    user.sub, { userInfo }
  );
  session.allow("*", session.FULL_ACCESS)
  // Authorize the user and return the result
  const { status, body } = await session.authorize();
  res.status(status).end(body);
  return
};

