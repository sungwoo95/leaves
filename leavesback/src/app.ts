import express, { Application } from "express";
import cors from "cors";
import connectToDB from "./config/db";
import treesRouter from "./routes/trees";

const app: Application = express(); 
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use("/api", treesRouter); 

const startServer = async () => {
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
