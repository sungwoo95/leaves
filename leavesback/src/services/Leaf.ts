import { ObjectId } from "mongodb";
import { leavesCollection } from "../config/db";
import liveblocks from "../liveblocks";

export const deleteLeaf = async (targetId: string) => {
  const leafDelRes = await leavesCollection.deleteOne({
    _id: new ObjectId(targetId),
  });
  if (!leafDelRes.acknowledged || leafDelRes.deletedCount === 0) {
    throw new Error(`[DeleteCase.HAS_PARENT] Failed to delete leaf`)
  }
  await liveblocks.deleteRoom(targetId);
}
