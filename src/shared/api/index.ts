export { db } from './database';
export { ensureDatabaseMigrated, migrateToLatest } from './migrator';
export type {
  BattleCatsTable,
  BattleHistoryTable,
  Database,
  FavoriteCatsTable,
  UsersTable,
} from './types';
