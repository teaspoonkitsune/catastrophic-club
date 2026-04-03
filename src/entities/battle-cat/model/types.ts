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
};
