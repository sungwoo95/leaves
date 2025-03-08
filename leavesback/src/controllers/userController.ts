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
  console.log("AccessToken전달");
  const userId = objectId.toString();
  const token = jwt.sign({ _id: userId }, process.env.JWT_SECRET as string, { expiresIn: "1d" });
  //sameSite: "none" (secure: true조건 충족 시,cross-origin쿠키 전송)
  //secure:true (https조건 충족 시 쿠키 전송)
  //res.cookie("access_token", token, { httpOnly: true, sameSite: "none", secure: true }); //배포 환경
  
  //sameSite: "lax"(cross-origin쿠키 전송 차단,링크 클릭 시 예외)
  //이를 위해 프론트측 Proxy설정(vite의 개발 서버에서 제공)해서 same-origin 요청을 달성.
  res.cookie("access_token", token, { httpOnly: true, sameSite: "lax" }); //개발 환경
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
    console.log("신규 회원 시작");
    const hashedPassword = await bcrypt.hash(password, 8);
    console.log("hashedPassword:", hashedPassword);
    const newUser = createUser(email, hashedPassword);
    const { insertedId } = await usersCollection.insertOne(newUser);
    if (insertedId) {
      sendAccessToken(res, insertedId);
      return
    } else {
      res.status(500).json({ message: "failed to insert user to db" });
      return 
    }
  } else {//기존 회원.
    console.log("기존 회원 시작");
    if (!(await bcrypt.compare(password, user.password))) {
      console.log("패스워드 불일치");
      res.status(401).json({ message: "Incorrect Password" });
      return
    }
    sendAccessToken(res, user._id);
    return
  }
};
