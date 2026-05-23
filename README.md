# Cin7 Products Sync

Express.js + TypeScript app for syncing Cin7-like products into MySQL and showing them in a small web UI.

For this task the real Cin7 API is mocked, so Cin7 credentials are not required. The app still uses production-like sync logic: pagination, rate limiting, retry, logging, and UPSERT by `cin7_id`.

## Requirements

- Node.js 20+
- MySQL 8+
- npm

## 1. Create `.env`

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=3000

DATABASE_URL="mysql://root:root@localhost:3306/cin7_products_sync"

CIN7_API_BASE_URL="https://inventory.dearsystems.com/ExternalApi/v2"
CIN7_ACCOUNT_ID=""
CIN7_APPLICATION_KEY=""

LOG_LEVEL=info
```

## 2. Start MySQL

With Docker:

```bash
docker run --name cin7-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=cin7_products_sync -p 3306:3306 -d mysql:8
```

If the container already exists:

```bash
docker start cin7-mysql
```

If you use local MySQL instead, create a database named `cin7_products_sync` and update `DATABASE_URL` if needed.

## 3. Install And Prepare DB

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
```

When Prisma asks for a migration name, enter:

```text
init
```

## 4. Run The App

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 5. How To Check

1. Open `http://localhost:3000`.
2. The products table may be empty before the first sync.
3. Click `Update all Products`.
4. Wait until the status changes to a successful update.
5. Products should appear in the table.
6. Use `Previous` / `Next` to move through pages.
7. Click a SKU to open the related Cin7 product URL in a new tab.
8. Run sync again and confirm products are updated, not duplicated.

## API Endpoints

```http
GET  /products?page=1&limit=20
POST /sync
GET  /sync/status
GET  /health
```

Aliases are also available:

```http
GET  /api/products?page=1&limit=20
POST /api/sync
GET  /api/sync/status
```

## Useful Scripts

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

## Notes

- Mock Cin7 fixture: `docs/fixtures/cin7-products-page-1.json`
- Sync loads 4000 mock products in pages of 1000.
- Cin7-like requests are rate limited to 60 requests/second and retried on temporary failures.
