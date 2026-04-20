// // db.js
// const { Pool } = require("pg");
require("dotenv").config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
// });

// module.exports = pool;


// db.js or prisma.js
const { PrismaClient } = require('./generated/prisma');
const {PrismaPg} = require('@prisma/adapter-pg')

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});


const prisma = new PrismaClient({ adapter });
module.exports = prisma;