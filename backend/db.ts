// Replace the standard import with the direct path to the generated client
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

// This instance will now use the updated types (firstName, lastName, etc.)
const prisma = new PrismaClient({ adapter });

export default prisma;