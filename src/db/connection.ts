import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env, isProdEnv } from "@/config/env.js";
import { remember } from "@epic-web/remember";

const createConnection = async () => {
  return mysql.createPool({
    uri: env.DATABASE_URL,
  });
};

let client;

if (isProdEnv()) {
  client = await createConnection();
} else {
  client = await remember("dbPool", () => createConnection());
}

export const db = drizzle(client);
