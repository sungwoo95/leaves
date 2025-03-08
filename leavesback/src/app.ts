import "dotenv/config";
import express, { Application } from "express";
import cors from "cors";
import treeRouter from "./routes/treeRouter";
import userRouter from "./routes/userRouter";
import { connectToDB } from "./config/db";

const app: Application = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());//req.body를 자동으로 JSON 객체로 변환
app.use(
  cors()
);
app.use("/api/tree",treeRouter);
app.use("/api/user",userRouter);

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
