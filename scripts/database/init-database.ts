#!/usr/bin/env ts-node

import { initDatabase } from "../../lib/database";

async function main() {
  console.log("🚀 Initializing database...");
  console.log("ℹ️  Note: For full database setup including Agent tables, use 'npm run db:setup'");

  try {
    await initDatabase();
    console.log("✅ Database initialized successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
}

main();
