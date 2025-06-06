import { ObjectId } from "mongodb";
import { forestsCollection, usersCollection } from "../config/db";
import { auth } from "../firebase"
import { deleteForest, leaveForest } from "./Forest";

export const deleteFirebaseUser = async (sub: string) => {
  await auth.deleteUser(sub);
}

export const deleteUserData = async (sub: string) => {
  const user = await usersCollection.findOne({ sub });
  if (!user) {
    throw new Error(`User not found: ${sub}`);
  }
  const myForests = user.myForests

  for (const forest of myForests) {
    const forestId = forest.forestId;
    // forest 문서 조회
    const forestDoc = await forestsCollection.findOne({ _id: new ObjectId(forestId) });
    if (!forestDoc) continue;
    const participants = forestDoc.participants

    if (participants.length === 1 && participants[0] === sub) {
      await deleteForest(forestId);
    } else if (participants.length >= 2) {
      await leaveForest(forestId, sub);
    }
  }
};
