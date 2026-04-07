"use client";

import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  addFavoriteCatToApi,
  isFavoriteCatInApi,
  removeFavoriteCatFromApi,
} from "@/entities/favorite-cat/api";
import type { FavoriteCatInput } from "@/entities/favorite-cat";
import { toHttpCatError } from "@/shared/lib/http-cat";
import { HttpCatErrorState } from "@/shared/ui/http-cat-error";
import styles from "./toggle-favorite-button.module.css";

type ToggleFavoriteButtonProps = FavoriteCatInput & {
  className?: string;
  size?: "md" | "sm";
  showOnHover?: boolean;
  isAuthenticated?: boolean;
};

function getButtonClassName(size: "md" | "sm", isFavorite: boolean) {
  if (size === "sm") {
    return isFavorite
      ? [styles.button, styles.small, styles.active].join(" ")
      : [styles.button, styles.small].join(" ");
  }

  return isFavorite ? [styles.button, styles.active].join(" ") : styles.button;
}

export function ToggleFavoriteButton({
  id,
  imageUrl,
  className,
  size = "md",
  showOnHover = true,
  isAuthenticated = false,
}: ToggleFavoriteButtonProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    if (isAuthenticated === false) {
      setIsFavorite(false);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadFavoriteState() {
      try {
        setErrorStatus(null);
        setShowAuthPrompt(false);
        const next = await isFavoriteCatInApi(id);

        if (isMounted) {
          setIsFavorite(next);
        }
      } catch (error) {
        console.error("Failed to load favorite state", error);
        setErrorStatus(toHttpCatError(error).status);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadFavoriteState();

    return () => {
      isMounted = false;
    };
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (showAuthPrompt === false) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current?.contains(event.target as Node)) {
        return;
      }

      setShowAuthPrompt(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [showAuthPrompt]);

  async function handleClick() {
    if (isAuthenticated === false) {
      setShowAuthPrompt(true);
      return;
    }

    try {
      setIsLoading(true);
      setErrorStatus(null);
      setShowAuthPrompt(false);

      if (isFavorite) {
        await removeFavoriteCatFromApi(id);
        setIsFavorite(false);
      } else {
        await addFavoriteCatToApi({ id, imageUrl });
        setIsFavorite(true);
      }
    } catch (error) {
      const httpError = toHttpCatError(error);

      console.error("Failed to toggle favorite", error);

      if (httpError.status === 401) {
        setShowAuthPrompt(true);
        setIsFavorite(false);
      } else {
        setErrorStatus(httpError.status);
      }
    } finally {
      setIsLoading(false);
    }
  }

  const buttonClassName = getButtonClassName(size, isFavorite);
  const rootClassName = className ? [styles.root, className].join(" ") : styles.root;

  return (
    <div
      ref={rootRef}
      className={rootClassName}
      data-hover-only={showOnHover ? "true" : "false"}
    >
      <button
        type="button"
        aria-pressed={isFavorite}
        aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
        onClick={handleClick}
        disabled={isLoading}
        className={buttonClassName}
      >
        <span
          className={styles.icon}
          aria-hidden="true"
        >
          {isFavorite ? <Star fill="currentColor" /> : <Star />}
        </span>
      </button>

      {showAuthPrompt ? (
        <div
          className={styles.authPopup}
          role="status"
        >
          <p className={styles.authTitle}>Нужно войти в аккаунт</p>
          <p className={styles.authText}>Избранное сохраняется только для участников клуба.</p>
        </div>
      ) : null}

      {errorStatus ? (
        <div className={styles.errorPopup}>
          <HttpCatErrorState
            compact
            status={errorStatus}
            title="Не удалось сохранить"
            description="Сервер вернул ошибку при работе с избранным."
            actionLabel="Ок"
            onAction={() => setErrorStatus(null)}
          />
        </div>
      ) : null}
    </div>
  );
}
