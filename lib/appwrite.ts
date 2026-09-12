import { Client, Storage ,TablesDB } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

export const tablesDB = new TablesDB(client);
export const storage = new Storage(client);

export const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
export const APPLICATIONS_TABLE_ID = process.env.APPWRITE_APPLICATIONS_TABLE_ID!;
export const ROUND1_TABLE_ID = process.env.APPWRITE_ROUND1_TABLE_ID!;

export const ROUND2_TASKS_TABLE_ID = process.env.APPWRITE_ROUND2_TASKS_TABLE_ID!;
export const ROUND2_SUBMISSIONS_TABLE_ID = process.env.APPWRITE_ROUND2_SUBMISSIONS_TABLE_ID!;
export const ROUND2_BUCKET_ID = process.env.APPWRITE_ROUND2_BUCKET_ID!;