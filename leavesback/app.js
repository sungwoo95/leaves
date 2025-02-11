import express from 'express';
import  connectToDB  from './config/db.js';

const app = express();
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await connectToDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
}

startServer();
