import { Request, Response } from 'express';
import { forestsCollection, usersCollection } from '../config/db';
import { Directory, Forest, MyForestInfo } from '../types';
import { ObjectId } from 'mongodb';
import { auth } from '../firebase';

export const createForest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const forestName = req.body.forestName;
  if (!req.user) { res.status(401).json({ message: '[userController][readMainPageData]Unauthorized' }); return; }
  const sub = req.user.sub;
  try {
    const newForest: Forest = {
      owner: sub,
      name: forestName,
      directories: [],
      participants: [sub],
    };
    const newForestObjectId: ObjectId = (
      await forestsCollection.insertOne(newForest)
    ).insertedId;
    const newMyForestInfo: MyForestInfo = {
      forestId: newForestObjectId.toString(),
      isOwner: true,
    };
    await usersCollection.updateOne(
      { sub },
      { $push: { myForests: newMyForestInfo } }
    );
    res.status(201).json({
      message: 'Forest created successfully',
      newMyForestInfo,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const readForest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { forestId } = req.params;
  const objectId = new ObjectId(forestId);
  try {
    const forest: Forest | null = await forestsCollection.findOne({
      _id: objectId,
    });
    if (!forest) {
      console.log('Forest not found');
      res.status(404).json({ message: 'Forest not found' });
      return;
    }
    res.json(forest);
  } catch (error) {
    console.log('[forestController]readForest Error');
    res.status(500).json({ message: 'internal error' });
  }
};

export const updateForestDirectories = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    forestId,
    directories,
  }: { forestId: string; directories: Directory[] } = req.body;
  const objectId = new ObjectId(forestId);
  try {
    const result = await forestsCollection.updateOne(
      { _id: objectId },
      { $set: { directories: directories } }
    );
    if (result.matchedCount === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({ message: 'Directories updated successfully' });
  } catch (error) {
    console.error(
      '[userController][updateDirectories] Error updating directories:',
      error
    );
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const addMemberToForest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, forestId }: { email: string; forestId: string } = req.body;

  try {
    // 1. 이메일로 Firebase 유저 조회
    const firebaseUser = await auth.getUserByEmail(email);
    const targetSub = firebaseUser.uid;

    // 2. forestId → ObjectId 변환
    const forestObjectId = new ObjectId(forestId);

    // 3. forest 조회
    const forest = await forestsCollection.findOne({ _id: forestObjectId });
    if (!forest) {
      throw Error();
    }

    // 4. 이미 참가자인지 확인
    if (forest.participants.includes(targetSub)) {
      res.status(409).json({ message: 'User already a participant' });
      return;
    }

    // 5. forest에 sub 추가
    await forestsCollection.updateOne(
      { _id: forestObjectId },
      { $push: { participants: targetSub } }
    );

    // 6. 유저 컬렉션에서 sub로 찾기
    const userDoc = await usersCollection.findOne({ sub: targetSub });
    if (!userDoc) {
      throw Error();
    }

    // 7. 유저의 myForests에 추가
    const newMyForestInfo: MyForestInfo = {
      forestId: forestObjectId.toString(),
      isOwner: false,
    };

    await usersCollection.updateOne(
      { sub: targetSub },
      { $push: { myForests: newMyForestInfo } }
    );

    res.status(200).json({ message: 'User invited successfully' });
  } catch (error) {
    console.error('Error inviting user:', error);
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const err = error as { code: string };
      if (err.code === 'auth/user-not-found') {
        res.status(404).json({ message: "We couldn't find a user with that email. Please make sure the email is correct or ask them to sign up first." });
        return;
      }
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};