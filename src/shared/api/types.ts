export interface Database {
  users: UsersTable;
  favorite_cats: FavoriteCatsTable;
  battle_cats: BattleCatsTable;
  battle_history: BattleHistoryTable;
  battle_vote_limits: BattleVoteLimitsTable;
  cat_of_the_day: CatOfTheDayTable;
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

export interface BattleHistoryTable {
  id: string;
  userId: string;
  winnerId: string;
  winnerImageUrl: string;
  loserId: string;
  loserImageUrl: string;
  createdAt: Date;
}

export interface BattleVoteLimitsTable {
  userId: string;
  voteDate: string;
  voteCount: number;
  updatedAt: Date;
}

export interface CatOfTheDayTable {
  dateKey: string;
  catId: string;
  imageUrl: string;
  createdAt: Date;
}
