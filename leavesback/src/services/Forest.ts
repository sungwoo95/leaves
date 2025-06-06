import { ObjectId } from "mongodb";
import { forestsCollection, usersCollection } from "../config/db";
import { deleteTreeFromDirectories } from "./Tree";
import { broadCast } from "./Common";
import { WsMessageType } from "../types";
import { WebSocket } from "ws";

export const deleteForest = async (forestId: string, ws?: WebSocket) => {
  const forestObjectId = new ObjectId(forestId);
  // Forest 문서 조회
  const forest = await forestsCollection.findOne({ _id: forestObjectId });
  if (!forest) {
    throw new Error('Forest not found');
  }
  // Forest 문서 삭제
  const result = await forestsCollection.deleteOne({ _id: forestObjectId });
  if (result.deletedCount === 0) {
    throw new Error('Failed to delete forest');
  }
  //directories 소속 tree제거.
  deleteTreeFromDirectories(forest.directories);
  // Forest 참가자들의 User 문서 업데이트
  for (const participantSub of forest.participants) {
    await usersCollection.updateOne(
      { sub: participantSub },
      {
        $pull: {
          myForests: { forestId },
        },
      }
    );
  }
  // 브로드캐스트
  broadCast(forestId, WsMessageType.DELETE_FOREST, { forestId }, ws);
}

export const leaveForest = async (forestId: string, sub: string, ws?: WebSocket) => {
  const forestObjectId = new ObjectId(forestId);
  await usersCollection.updateOne(
    { sub },
    {
      $pull: {
        myForests: { forestId },
      },
    }
  );
  await forestsCollection.updateOne(
    { _id: forestObjectId },
    {
      $pull: {
        participants: sub,
      },
    }
  );
  broadCast(forestId, WsMessageType.LEAVE_FOREST, { forestId, sub }, ws);
}