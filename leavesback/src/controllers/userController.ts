import { Directory, DirectoryType, User } from "../types";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { usersCollection } from "../config/db";
import jwt from "jsonwebtoken";

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

export const readDirectories = (req: Request, res: Response): void => {
  console.log("[userController]getDirectories called");
  res.json(fileTree);//json메서드는 내부에서 객체를 json으로 변환,Content-Type: application/json설정함
};

export const updateDirectories = (req: Request, res: Response): void => {
  console.log("[userController] postDirectories called");
  const newDirectories: Directory[] = req.body;
  fileTree = newDirectories;
};

const createUser = (id: string, password: string, email: string): User => {
  return {
    id,
    password,
    email,
    directories: [],
    forests: [],
    treeId: null,
    leafId: null,
  }
}

export const signUp = async (req: Request, res: Response) => {
  const { id, password, email } = req.body;
  const existingUser = await usersCollection.findOne({ id }); //id가 id인 문서를 찾음. 
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 8);
  console.log("hashedPassword:", hashedPassword);
  const newUser = createUser(id, hashedPassword, email);
  await usersCollection.insertOne(newUser);
  res.json({ message: "Signed Up" });
};

export const signIn = async (req: Request, res: Response) => { 
  const { id, password } = req.body;
  const user = await usersCollection.findOne({id},{projection:{_id:1,password:1}}) 
  if(!user){
    return res.status(404).json({ message: "User is not exists" });
  }
  if(!(await bcrypt.compare(password,user.password))){
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET as string, { expiresIn: "1d" })
  res.cookie("access_token",token,{httpOnly:true,sameSite:"none",secure:true}); //sameSite:"none"(크로스 사이트 요청에도 쿠키 전송)의 경우 secure:true(https만 쿠키 전송)필수.
  res.json({ message: "Signed in" });
};