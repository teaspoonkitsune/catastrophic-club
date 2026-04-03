**Local Keycloak**

Локальный Keycloak для проекта лежит в [infra/keycloak/podman-compose.yml](/var/mnt/e8a60d94-d9f4-4b60-9f78-1ce555e004cc/Projects/catastrophic-club/infra/keycloak/podman-compose.yml).

Канонический локальный сценарий:
- приложение: `http://localhost:3000`
- Keycloak: `http://localhost:8080`

Лучше не смешивать `localhost`, `127.0.0.1`, IP из локальной сети и нестандартные порты внутри одного auth-flow.

Что уже подготовлено:
- realm `catastrophic-club`
- client `catastrophic-club-web`
- secret `change-me-for-local-dev`
- разрешённая регистрация пользователей
- PKCE `S256`
- redirect URI `http://localhost:3000/api/auth/callback`
- post logout redirect `http://localhost:3000/*`
- root/base URL клиента `http://localhost:3000`

Файлы:
- compose: [podman-compose.yml](/var/mnt/e8a60d94-d9f4-4b60-9f78-1ce555e004cc/Projects/catastrophic-club/infra/keycloak/podman-compose.yml)
- import realm: [catastrophic-club-realm.json](/var/mnt/e8a60d94-d9f4-4b60-9f78-1ce555e004cc/Projects/catastrophic-club/infra/keycloak/realm-import/catastrophic-club-realm.json)
- env для контейнера: [.env.example](/var/mnt/e8a60d94-d9f4-4b60-9f78-1ce555e004cc/Projects/catastrophic-club/infra/keycloak/.env.example)
- env для приложения: [/.env.example](/var/mnt/e8a60d94-d9f4-4b60-9f78-1ce555e004cc/Projects/catastrophic-club/.env.example)

Запуск:

```sh
cd infra/keycloak
cp .env.example .env
podman compose up -d
```

Если `podman compose` у тебя не установлен, можно запускать напрямую:

```sh
cd infra/keycloak
podman volume create keycloak-data
podman run -d \
  --name catastrophic-club-keycloak \
  -p 8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  -v "$(pwd)/realm-import:/opt/keycloak/data/import:Z" \
  -v keycloak-data:/opt/keycloak/data:Z \
  quay.io/keycloak/keycloak:26.5.5 \
  start-dev --import-realm --hostname=http://localhost:8080
```

Админка:

```text
http://localhost:8080/admin/
```

Логин по умолчанию:
- username: `admin`
- password: `admin`

Для приложения создай `.env.local` в корне проекта на основе [/.env.example](/var/mnt/e8a60d94-d9f4-4b60-9f78-1ce555e004cc/Projects/catastrophic-club/.env.example).

Минимальный набор:

```env
AUTH_SECRET=replace-with-a-long-random-string
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=catastrophic-club
KEYCLOAK_CLIENT_ID=catastrophic-club-web
KEYCLOAK_CLIENT_SECRET=change-me-for-local-dev
```

Проверка после запуска:
1. Открой приложение только на `http://localhost:3000`.
2. Нажми `login` или `register`.
3. После callback должна появиться cookie `catastrophic_club_session` на `localhost:3000`.
4. В шапке должно появиться `signed in as ...`.

Если нужно переимпортировать realm с нуля:

```sh
cd infra/keycloak
podman compose down -v
podman compose up -d
```

Это удалит volume `keycloak-data` и поднимет Keycloak заново с импортом realm.
