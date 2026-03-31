#!/usr/bin/env node
/**
 * Reads SequelizeMeta and creates empty stub files for any migration
 * that exists in the DB but not on disk.
 */
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.resolve(__dirname, '../src/database/migrations');

const client = new Client({
  user: process.env.DB_USER || 'engboost',
  password: process.env.DB_PASSWORD || 'engboost123',
  database: process.env.DB_NAME || 'engboost_db',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

const stub = `'use strict';\n\nmodule.exports = {\n  async up(queryInterface, Sequelize) {},\n  async down(queryInterface, Sequelize) {},\n};\n`;

async function main() {
  await client.connect();
  const { rows } = await client.query('SELECT name FROM "SequelizeMeta" ORDER BY name');
  await client.end();

  const existing = new Set(fs.readdirSync(MIGRATIONS_DIR));
  let created = 0;

  for (const { name } of rows) {
    if (!existing.has(name)) {
      fs.writeFileSync(path.join(MIGRATIONS_DIR, name), stub);
      console.log(`Created stub: ${name}`);
      created++;
    }
  }

  if (created === 0) {
    console.log('No missing migrations found.');
  } else {
    console.log(`\nDone. Created ${created} stub(s). Now run: npx sequelize-cli db:migrate:undo:all`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
