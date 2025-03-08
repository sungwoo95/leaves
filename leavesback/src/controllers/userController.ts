import { Directory, DirectoryType, User } from "../types";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { usersCollection } from "../config/db";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
const JWT_SECRET = process.env.JWT_SECRET as string;

const createUser = (email: string, password: string): User => {
  return {
    email,
    password,
    directories: [],
    forests: [],
    treeId: null,
    leafId: null,
  };
};

const sendAccessToken = (res: Response, objectId: ObjectId): void => {
  console.log("AccessToken전달");
  const userObjectIdString = objectId.toString();
  const token = jwt.sign({ userObjectIdString }, JWT_SECRET, { expiresIn: "1d" });
  //sameSite: "none" (secure: true조건 충족 시,cross-origin쿠키 전송)
  //secure:true (https조건 충족 시 쿠키 전송)
  //res.cookie("access_token", token, { httpOnly: true, sameSite: "none", secure: true }); //배포 환경

  //sameSite: "lax"(cross-origin쿠키 전송 차단,링크 클릭 시 예외)
  //이를 위해 프론트측 Proxy설정(vite의 개발 서버에서 제공)해서 same-origin 요청을 달성.
  res.cookie("access_token", token, { httpOnly: true, sameSite: "lax" }); //개발 환경
  res.json({ message: "Signed in" });
};

//토큰 만료 예외 처리 해야 함.
const parseAccessToken = (token: string): ObjectId | void => {
  try {
    //verify메서드: 1.토큰 변조,만료 확인, 2.Payload | string 반환 (payload의 값이 string일 경우 string 반환)
    const decoded = jwt.verify(token, JWT_SECRET) as { userObjectIdString: string };
    return new ObjectId(decoded.userObjectIdString);
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      console.error("🚨 변조된 토큰:", error.message);
    } else if (error.name === "TokenExpiredError") {
      console.error("⌛ 토큰 만료됨:", error.message);
    } else {
      console.error("❌ 기타 오류:", error.message);
    }
    return;
  }
};


export const readDirectories = async (req: Request, res: Response): Promise<void> => {
  console.log("[userController] getDirectories called");

  const token = req.cookies.access_token;
  if (!token) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  const userId = parseAccessToken(token);
  //토큰 만료등 예외 처리 해야 함.
  if (!userId) {
    res.status(401).json({ message: "Access Token error" });
    return;
  }

  try {
    const user = await usersCollection.findOne({ _id: userId });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ directories: user.directories });
    return;
  } catch (error) {
    console.error("[userController][readDirectories] Error read directories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const updateDirectories = (req: Request, res: Response): void => {
  console.log("[userController] postDirectories called");
  const newDirectories: Directory[] = req.body;
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
      return;
    } else {
      res.status(500).json({ message: "failed to insert user to db" });
      return;
    }
  } else {//기존 회원.
    console.log("기존 회원 시작");
    if (!(await bcrypt.compare(password, user.password))) {
      console.log("패스워드 불일치");
      res.status(401).json({ message: "Incorrect Password" });
      return;
    }
    sendAccessToken(res, user._id);
    return;
  }
};
