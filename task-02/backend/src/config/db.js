import "dotenv/config";

import pg from "pg" ;



const { Pool } = pg;

// console.log( "DATABASE_URL loaded:",
//   process.env.DATABASE_URL ? "YES" : "NO"
// );

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL is missing");
// }

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,   
    },
});

export default pool;