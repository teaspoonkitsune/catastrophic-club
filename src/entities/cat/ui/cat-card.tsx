'use client';

import { useState } from 'react';

type CatCardProps = {
  name: string;
  age: number;
  wins: number;
};

export function CatCard({ name, age, wins }: CatCardProps) {
  const [likes, setLikes] = useState(0);

  function handleLike() {
    setLikes((current) => current + 1);
  }

  return (
    <div>
      <h2>{name}</h2>
      <p>Возраст: {age}</p>
      <p>Побед: {wins}</p>
      <p>Лайков: {likes}</p>
      <button type="button" onClick={handleLike}>
        Лайк
      </button>
    </div>
  );
}
