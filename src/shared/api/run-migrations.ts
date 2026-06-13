import { createLogger } from '@/shared/lib/logger';
import { db } from './database';
import { migrateToLatest } from './migrator';

const logger = createLogger('db.run-migrations');

async function main() {
  logger.info('db.migrate_started');
  await migrateToLatest();
  logger.info('db.migrate_completed');
}

main()
  .then(async () => {
    await db.destroy();
  })
  .catch(async (error) => {
    logger.error('db.migrate_command_failed', error);
    await db.destroy();
    process.exit(1);
  });
