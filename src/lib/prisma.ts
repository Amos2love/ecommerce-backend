import "dotenv/config";
import { Pool } from "pg"; // <-- You must import Pool from 'pg'
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

// 1. Create the database connection pool
const pool = new Pool({ connectionString });

// 2. Pass the pool into the Prisma adapter (not the connection string directly)
const adapter = new PrismaPg(pool);

// 3. Initialize Prisma
const prisma = new PrismaClient({ adapter });

export { prisma };