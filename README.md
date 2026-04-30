# دیجی‌اسکریپت — پلتفرم فروش محصولات دیجیتال

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Fastify](https://img.shields.io/badge/Fastify-5-blue)

یک پلتفرم کامل، مقیاس‌پذیر و امن برای فروش اسکریپت‌ها، ابزارهای SaaS و راهکارهای کسب‌وکار — با رابط کاربری فارسی RTL

</div>

---

## 📁 ساختار پروژه

```
digiscript/
├── backend/          # API Server — Fastify + TypeScript + Drizzle ORM
├── frontend/         # سایت اصلی — Next.js 16 + TailwindCSS (RTL/فارسی)
└── admin/            # پنل ادمین — Next.js جداگانه (RTL/فارسی)
```

---

## ⚙️ پیش‌نیازها

قبل از شروع مطمئن شو این‌ها نصب هستند:

| ابزار | نسخه حداقل | لینک دانلود |
|-------|------------|------------|
| **Node.js** | v20+ | https://nodejs.org |
| **npm** | v10+ | همراه Node.js |
| **MySQL** | v8.0+ | https://dev.mysql.com/downloads/ |

---

## 🚀 راه‌اندازی گام به گام

### گام ۱ — دانلود پروژه

```bash
git clone https://github.com/alisehatiuk-blip/storefile.git digiscript
cd digiscript
git checkout cursor/digital-marketplace-platform-9cc2
```

---

### گام ۲ — راه‌اندازی MySQL

ابتدا MySQL را شروع کن، سپس دیتابیس بساز:

```bash
# ورود به MySQL
mysql -u root -p

# داخل MySQL:
CREATE DATABASE marketplace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# اجرای migration (ساخت تمام جداول)
mysql -u root -p marketplace_db < backend/src/db/migrations/0001_init.sql
```

---

### گام ۳ — راه‌اندازی Backend

```bash
cd backend

# کپی فایل محیطی
cp .env.example .env
```

فایل `.env` را باز کن و مقادیر زیر را ویرایش کن:

```env
# اطلاعات دیتابیس
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=رمز_MySQL_خودت
DB_NAME=marketplace_db

# JWT Secret (حتماً تغییر بده — حداقل ۳۲ کاراکتر)
JWT_SECRET=یک_کلید_تصادفی_قوی_حداقل_۳۲_کاراکتر_اینجا
JWT_REFRESH_SECRET=یک_کلید_دیگر_تصادفی_قوی_حداقل_۳۲_کاراکتر

# سایر تنظیمات (پیش‌فرض مناسب هستند)
PORT=4000
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

```bash
# نصب وابستگی‌ها
npm install

# بارگذاری داده‌های اولیه (محصولات، کاربران، دسته‌بندی‌ها)
npm run seed

# شروع سرور توسعه
npm run dev
```

✅ بک‌اند روی **http://localhost:4000** اجرا می‌شود

---

### گام ۴ — راه‌اندازی Frontend (سایت اصلی)

```bash
# از پوشه اصلی پروژه:
cd frontend

# نصب وابستگی‌ها
npm install

# شروع
npm run dev
```

✅ سایت اصلی روی **http://localhost:3000** اجرا می‌شود

---

### گام ۵ — راه‌اندازی پنل ادمین

```bash
# از پوشه اصلی پروژه:
cd admin

# نصب وابستگی‌ها
npm install

# شروع روی پورت 3001
npm run dev -- --port 3001
```

✅ پنل ادمین روی **http://localhost:3001** اجرا می‌شود

---

## 🔑 اطلاعات ورود (پس از seed)

| نقش | ایمیل | رمز عبور | آدرس |
|-----|-------|---------|------|
| **ابر مدیر** | admin@digiscript.ir | Admin@123456 | http://localhost:3001 |
| **کاربر آزمایشی** | user@example.com | User@123456 | http://localhost:3000 |

> ⚠️ **مهم:** رمزهای بالا فقط برای محیط توسعه است. در محیط production حتماً تغییر بده.

---

## 🌐 صفحات سایت اصلی (localhost:3000)

| صفحه | آدرس | توضیح |
|------|------|-------|
| صفحه اصلی | `/` | hero، ویژگی‌ها، محصولات |
| محصولات | `/products` | لیست با فیلتر و جستجو |
| جزئیات محصول | `/products/[slug]` | گالری، ویژگی‌ها، خرید |
| جستجو | `/search` | جستجوی زنده |
| درباره ما | `/about` | |
| تماس | `/contact` | |
| سوالات متداول | `/faq` | |
| ورود | `/login` | |
| ثبت‌نام | `/register` | |
| داشبورد | `/dashboard` | (نیاز به ورود) |
| سفارش‌ها | `/dashboard/orders` | |
| دانلودها | `/dashboard/downloads` | |
| لایسنس‌ها | `/dashboard/licenses` | |
| تیکت‌ها | `/dashboard/tickets` | |
| پروفایل | `/dashboard/profile` | |

## 🔐 پنل ادمین (localhost:3001)

| بخش | توضیح |
|-----|-------|
| داشبورد | آمار درآمد، سفارش‌ها، فعالیت‌ها |
| محصولات | CRUD کامل با آپلود فایل و تصویر |
| دسته‌بندی‌ها | مدیریت سلسله‌مراتبی |
| کاربران | مدیریت، فعال/غیرفعال |
| سفارش‌ها | مشاهده و فیلتر |
| تیکت‌ها | پاسخ به تیکت‌های پشتیبانی |
| تنظیمات | تنظیمات سیستم key-value |
| لاگ‌ها | لاگ فعالیت و امنیت |

---

## 📡 API Endpoints (localhost:4000)

```
GET  /health                          # وضعیت سرور

POST /api/auth/register               # ثبت‌نام
POST /api/auth/login                  # ورود
POST /api/auth/refresh                # تجدید توکن
POST /api/auth/logout                 # خروج

GET  /api/products                    # لیست محصولات
GET  /api/products/:slug              # جزئیات محصول
POST /api/products                    # ایجاد (ادمین)
PUT  /api/products/:id                # ویرایش (ادمین)
DELETE /api/products/:id              # حذف (ادمین)

GET  /api/categories                  # دسته‌بندی‌ها
POST /api/orders                      # ثبت سفارش
GET  /api/orders/my                   # سفارش‌های من

POST /api/downloads/generate/:fileId  # ایجاد لینک دانلود
GET  /api/downloads/file/:token       # دانلود فایل

GET  /api/licenses/my                 # لایسنس‌های من
GET  /api/licenses/verify/:key        # تایید لایسنس

POST /api/tickets                     # ایجاد تیکت
GET  /api/tickets/my                  # تیکت‌های من

GET  /api/admin/dashboard             # آمار ادمین (ادمین)
GET  /api/admin/logs                  # لاگ‌ها (ادمین)
```

---

## 🗄️ جداول دیتابیس

| جدول | توضیح |
|------|-------|
| `users` | کاربران + نقش‌ها |
| `refresh_tokens` | توکن‌های JWT |
| `categories` | دسته‌بندی‌های محصول |
| `products` | محصولات |
| `product_categories` | رابطه محصول-دسته |
| `product_images` | تصاویر محصولات |
| `product_files` | فایل‌های دانلود (محافظت شده) |
| `orders` | سفارش‌ها |
| `order_items` | آیتم‌های سفارش |
| `licenses` | کلیدهای لایسنس |
| `downloads` | لاگ دانلودها + توکن موقت |
| `tickets` | تیکت‌های پشتیبانی |
| `ticket_messages` | پیام‌های تیکت |
| `settings` | تنظیمات سیستم |
| `activity_logs` | لاگ امنیتی |

---

## 🔒 امنیت

- JWT access token (15 دقیقه) + refresh token (7 روز) با rotation
- bcrypt رمز عبور (12 rounds)
- Rate limiting (100 req/min)
- Helmet security headers
- CORS محدود به دامنه‌های مجاز
- دانلود فایل با توکن HMAC-SHA256 موقت (1 ساعت، max 3 بار)
- Zod validation روی تمام ورودی‌ها
- لاگ تمام رویدادهای مهم

---

## 🛠️ تکنولوژی‌ها

**Backend:**
- Fastify 5 + TypeScript
- Drizzle ORM + MySQL2
- JWT + bcryptjs + Zod

**Frontend & Admin:**
- Next.js 16 (App Router) + TypeScript
- TailwindCSS v4
- TanStack Query + Zustand + React Hook Form

---

## 📝 دستورات مفید

```bash
# Backend
npm run dev          # اجرای توسعه
npm run build        # build تولید
npm run seed         # بارگذاری داده‌های اولیه
npm run db:push      # push schema به دیتابیس

# Frontend & Admin
npm run dev          # اجرای توسعه
npm run build        # build تولید
npm start            # اجرای تولید
```

---

## ❓ مشکلات رایج

**خطای اتصال به دیتابیس:**
- مطمئن شو MySQL در حال اجراست
- اطلاعات `.env` را چک کن
- مطمئن شو `marketplace_db` ساخته شده

**خطای توکن JWT:**
- مطمئن شو `JWT_SECRET` حداقل ۳۲ کاراکتر دارد
- مطمئن شو بک‌اند در حال اجراست

**صفحات لود نمی‌شوند:**
- بک‌اند باید قبل از فرانت‌اند اجرا شده باشد
- `NEXT_PUBLIC_API_URL` در `.env.local` را چک کن

---

<div align="center">
ساخته شده با ❤️ برای بازار ایران
</div>
