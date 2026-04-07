export type BattleCat = {
  id: string;
  imageUrl: string;
  score: number;
  createdAt: Date;
};

export type BattleCatRecord = {
  id: string;
  imageUrl: string;
  score: number;
};

export type BattleResultInput = {
  winnerId: string;
  loserId: string;
  userId: string;
};

export type BattleHistoryRecord = {
  id: string;
  winnerId: string;
  winnerImageUrl: string;
  loserId: string;
  loserImageUrl: string;
  createdAt: string;
};

export type BattleHistoryPage = {
  items: BattleHistoryRecord[];
  hasNext: boolean;
  offset: number;
  limit: number;
};
