import "dotenv/config";
import express, { Application } from "express";
import cors from "cors";
import treeRouter from "./routes/treeRouter";
import userRouter from "./routes/userRouter";
import { connectToDB } from "./config/db";
import cookieParser from "cookie-parser";
import forestRouter from "./routes/forestRouter";

const app: Application = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());//req.body를 자동으로 JSON 객체로 변환
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true,
  })
);

app.use("/api/tree",treeRouter);
app.use("/api/user",userRouter);
app.use("/api/forest",forestRouter);

const startServer = async () => {
  console.log("startServer");
  try {
    await connectToDB(); // 
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err: unknown) {
    console.error("Failed to start server:", err);
  }
};

startServer(); 
