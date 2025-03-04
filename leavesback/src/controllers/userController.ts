import { Directory, DirectoryType } from "../types";
import { Request, Response } from "express";

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

export const getDirectories = (req: Request, res: Response): void => {
  console.log("[userController]getDirectories called");
  res.json(fileTree);//json메서드는 내부에서 객체를 json으로 변환,Content-Type: application/json설정함
}

export const postDirectories = (req: Request, res: Response): void => {
  console.log("[userController] postDirectories called");
  const newDirectories: Directory[] = req.body;
  fileTree = newDirectories; 
};