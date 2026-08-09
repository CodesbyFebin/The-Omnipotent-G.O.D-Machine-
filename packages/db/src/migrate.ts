import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { getDb, closeDb } from './client.js';

async function main() {
  const db = getDb();
  console.log('running migrations from ./migrations …');
  await migrate(db, { migrationsFolder: './migrations' });
  console.log('done.');
  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
