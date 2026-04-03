export interface Database {
  users: UsersTable;
  favorite_cats: FavoriteCatsTable;
  battle_cats: BattleCatsTable;
}

export interface UsersTable {
  id: string;
  email: string;
  name: string | null;
}

export interface FavoriteCatsTable {
  userId: string;
  id: string;
  imageUrl: string;
  addedAt: Date;
}

export interface BattleCatsTable {
  id: string;
  imageUrl: string;
  score: number;
  createdAt: Date;
}
