import {MongoClient, Db} from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.MONGODB_URL || '';
const dbName = process.env.MONGODB_NAME || '';

const client = new MongoClient(url);
let db: Db;

export async function connectDB() {
    if(!db) {
        await client.db();
        db = client.db(dbName);
        console.log('Database connected');
    }

    return db;
}

export {client}