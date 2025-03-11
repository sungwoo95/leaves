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

const parseAccessToken = (token: string, res: Response): ObjectId | void => {
  try {
    //verify메서드: 1.토큰 변조,만료 확인, 2.Payload | string 반환 (payload의 값이 string일 경우 string 반환)
    const decoded = jwt.verify(token, JWT_SECRET) as { userObjectIdString: string };
    return new ObjectId(decoded.userObjectIdString);
  } catch (error: any) {
    //todo: 상황별 예외 처리 
    if (error.name === "JsonWebTokenError") {
      res.status(401).json({ message: "Unauthorized: No token provided" });
    } else if (error.name === "TokenExpiredError") {
      res.status(401).json({ message: "Unauthorized: No token provided" });
    } else {
      res.status(401).json({ message: "Unauthorized: No token provided" });
    }
  }
};

export const readDirectories = async (req: Request, res: Response): Promise<void> => {
  const cookies = req.cookies;
  if (!cookies) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }
  const accessToken = cookies.access_token;
  const objectId = parseAccessToken(accessToken, res);
  //todo: 상황별 예외처리 
  if (!objectId) {
    return;
  }
  try {
    const user = await usersCollection.findOne({ _id: objectId });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user.directories);
    return;
  } catch (error) {
    console.error("[userController][readDirectories] Error read directories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateDirectories = async (req: Request, res: Response): Promise<void> => {
  console.log("[userController] updateDirectories called");
  const newDirectories: Directory[] = req.body;
  const cookies = req.cookies;
  if (!cookies) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }
  const accessToken = cookies.access_token;
  const objectId = parseAccessToken(accessToken, res);
  //todo: 상황별 예외처리 
  if (!objectId) {
    return;
  }
  try {
    const result = await usersCollection.updateOne(
      { _id: objectId },
      { $set: { directories: newDirectories } }
    );
    if (result.matchedCount === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ message: "Directories updated successfully" });
  } catch (error) {
    console.error("[userController][updateDirectories] Error updating directories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const userStart = async (req: Request, res: Response) => {
  console.log("[userController]userStart called");
  const { email, password } = req.body;
  let user = await usersCollection.findOne({ email }, { projection: { password: 1 } })
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

export const readForests = async (req: Request, res: Response): Promise<void> => {
  console.log("readForests called");
  //쿠키 받고, ObjectId로 조회한 문서의 forests응답하기.
  const cookies = req.cookies;
  if (!cookies) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }
  const accessToken = cookies.access_token;
  const objectId = parseAccessToken(accessToken, res);
  //todo: 상황별 예외처리 
  if (!objectId) {
    return;
  }
  //objectId로 조회한 문서의 forests응답하기.
  try {
    // 특정 필드(forests)만 가져오기
    const forests = await usersCollection.findOne(
      { _id: objectId },
      { projection: { forests: 1, _id: 0 } }
    );
    if (!forests) {
      console.log("cannot find user");
      res.status(500).json({ message: "Internal server error" });
      return;
    }
    // forests 속성 응답
    res.json(forests);
  } catch (error) {
    console.error("[userController][readForests] Error reading forests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
