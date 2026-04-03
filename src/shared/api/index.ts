export { db } from './database';
export { ensureDatabaseMigrated, migrateToLatest } from './migrator';
export type {
  BattleCatsTable,
  Database,
  FavoriteCatsTable,
  UsersTable,
} from './types';
