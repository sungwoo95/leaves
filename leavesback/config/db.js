import 'dotenv/config';
import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToDB() {
  try {
    await client.connect();
    // 연결 테스트: admin 데이터베이스에 ping 명령 실행
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
}

export default connectToDB;
