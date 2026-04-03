import { db } from './database';
import { migrateToLatest } from './migrator';

async function main() {
  await migrateToLatest();
}

main()
  .then(async () => {
    await db.destroy();
  })
  .catch(async (error) => {
    console.error('Failed to run migrations', error);
    await db.destroy();
    process.exit(1);
  });
