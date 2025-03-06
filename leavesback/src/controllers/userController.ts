import { Directory, DirectoryType, User } from "../types";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { usersCollection } from "../config/db";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

let fileTree: Directory[] = [
  //임시 데이터.
  {
    id: "1",
    name: "Private Forest Documents",
    type: DirectoryType.FOLDER,
    children: [
      {
        id: "2",
        name: "resume.pdf",
        type: DirectoryType.FILE,
        children: [],
        isNew: false,
      },
      {
        id: "3",
        name: "notes.txt",
        type: DirectoryType.FILE,
        children: [],
        isNew: false,
      },
    ],
    isNew: false,
  },
  {
    id: "4",
    name: "Photos",
    type: DirectoryType.FOLDER,
    children: [
      {
        id: "5",
        name: "vacation.jpg",
        type: DirectoryType.FILE,
        children: [],
        isNew: false,
      },
      {
        id: "6",
        name: "Events",
        type: DirectoryType.FOLDER,
        children: [
          {
            id: "7",
            name: "birthday.jpg",
            type: DirectoryType.FILE,
            children: [],
            isNew: false,
          },
        ],
        isNew: false,
      },
    ],
    isNew: false,
  },
];

const createUser = (email: string, password: string): User => {
  return {
    email,
    password,
    directories: [],
    forests: [],
    treeId: null,
    leafId: null,
  }
}

const sendAccessToken = (res: Response, objectId: ObjectId): void => {
  const userId = objectId.toString();
  const token = jwt.sign({ _id: userId }, process.env.JWT_SECRET as string, { expiresIn: "1d" });
  res.cookie("access_token", token, { httpOnly: true, sameSite: "none", secure: true });
  res.json({ message: "Signed in" });
};

export const readDirectories = (req: Request, res: Response): void => {
  console.log("[userController]getDirectories called");
  res.json(fileTree);
};

export const updateDirectories = (req: Request, res: Response): void => {
  console.log("[userController] postDirectories called");
  const newDirectories: Directory[] = req.body;
  fileTree = newDirectories;
  res.json({ message: "directories update success" });
};

export const userStart = async (req: Request, res: Response) => {
  console.log("[userController]userStart called");
  const { email, password } = req.body;
  let user = await usersCollection.findOne({ email }, { projection: { _id: 1, password: 1 } })
  if (!user) {//신규 회원.
    const hashedPassword = await bcrypt.hash(password, 8);
    console.log("hashedPassword:", hashedPassword);
    const newUser = createUser(email, hashedPassword);
    const { insertedId } = await usersCollection.insertOne(newUser);
    if (insertedId) {
      sendAccessToken(res, insertedId);
    } else {
      res.status(500).json({ message: "Failed to create user" });
    }
  } else {//기존 회원.
    if (!(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Invalid credentials" });
    }
    sendAccessToken(res, user._id);
  }
};
