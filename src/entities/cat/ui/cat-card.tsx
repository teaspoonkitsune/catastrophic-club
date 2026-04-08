'use client';

import { useState } from 'react';
import { useI18n } from '@/shared/i18n';

type CatCardProps = {
  name: string;
  age: number;
  wins: number;
};

export function CatCard({ name, age, wins }: CatCardProps) {
  const { messages } = useI18n();
  const [likes, setLikes] = useState(0);

  function handleLike() {
    setLikes((current) => current + 1);
  }

  return (
    <div>
      <h2>{name}</h2>
      <p>{messages.catCard.age}: {age}</p>
      <p>{messages.catCard.wins}: {wins}</p>
      <p>{messages.catCard.likes}: {likes}</p>
      <button type="button" onClick={handleLike}>
        {messages.catCard.like}
      </button>
    </div>
  );
}
