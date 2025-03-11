import { MongoClient, ServerApiVersion } from "mongodb";
import { Forest, User } from "../types";

const uri: string | undefined = process.env.MONGO_URI;

if (!uri) {
  throw new Error("MONGO_URI is not defined in the environment variables");
}

//MongoDB 클라이언트 인스턴스 생성
export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
enum Database {
  NAMUNIBS = "namunibs",
}

enum Collection {
  USERS = "users",
  FORESTS = "forests",
}

const db = client.db(Database.NAMUNIBS);

export const usersCollection = db.collection<User>(Collection.USERS);
export const forestsCollection = db.collection<Forest>(Collection.FORESTS);

export const connectToDB = async (): Promise<MongoClient> => {
  try {
    await client.connect();
    // 연결 테스트: admin 데이터베이스에 ping 명령 실행
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err);
    throw err;
  }
};

