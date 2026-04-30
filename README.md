# دیجی‌اسکریپت - پلتفرم فروش محصولات دیجیتال

یک پلتفرم کامل و مقیاس‌پذیر برای فروش اسکریپت‌ها، ابزارهای SaaS و راهکارهای کسب‌وکار.

## 🏗 معماری سیستم

```
workspace/
├── backend/          # Fastify + TypeScript + Drizzle ORM
│   ├── src/
│   │   ├── config/       # تنظیمات محیطی و متغیرها
│   │   ├── db/           # اسکیما، مهاجرت‌ها و اتصال DB
│   │   │   ├── schema/   # مدل‌های Drizzle ORM
│   │   │   └── migrations/ # فایل SQL
│   │   ├── middleware/   # Auth، Logger
│   │   ├── modules/      # ماژول‌های تجاری
│   │   │   ├── auth/     # احراز هویت و رفرش توکن
│   │   │   ├── products/ # مدیریت محصولات
│   │   │   ├── categories/ # دسته‌بندی‌ها
│   │   │   ├── orders/   # سفارش‌ها
│   │   │   ├── downloads/ # دانلود امن
│   │   │   ├── licenses/ # لایسنس‌ها
│   │   │   ├── tickets/  # تیکت‌های پشتیبانی
│   │   │   ├── users/    # مدیریت کاربران
│   │   │   ├── admin/    # داشبورد ادمین
│   │   │   └── uploads/  # آپلود فایل و تصویر
│   │   ├── types/        # تایپ‌های TypeScript
│   │   └── utils/        # توابع کمکی
│   └── ...
├── frontend/         # Next.js App Router + TailwindCSS (RTL)
│   └── app/
│       ├── (auth)/       # صفحات احراز هویت
│       ├── (public)/     # صفحات عمومی
│       └── dashboard/    # داشبورد کاربر
└── admin/            # پنل ادمین جداگانه (Next.js RTL)
    └── app/
        ├── (auth)/       # ورود ادمین
        └── dashboard/    # بخش‌های مدیریت
```

## 🗄 طراحی پایگاه داده

### جداول اصلی:

| جدول | توضیح |
|------|-------|
| `users` | کاربران + نقش‌ها (user/admin/super_admin) |
| `refresh_tokens` | توکن‌های رفرش JWT |
| `categories` | دسته‌بندی‌های محصول (درختی) |
| `products` | محصولات با ویژگی‌های کامل |
| `product_categories` | رابطه چند-به-چند محصول/دسته |
| `product_images` | تصاویر گالری محصولات |
| `product_files` | فایل‌های قابل دانلود (محافظت‌شده) |
| `orders` | سفارش‌ها |
| `order_items` | آیتم‌های هر سفارش |
| `licenses` | کلیدهای لایسنس |
| `downloads` | لاگ دانلودها با توکن موقت |
| `tickets` | تیکت‌های پشتیبانی |
| `ticket_messages` | پیام‌های هر تیکت |
| `settings` | تنظیمات سیستم (key-value) |
| `activity_logs` | لاگ فعالیت‌ها و امنیت |

## 🚀 راه‌اندازی

### پیش‌نیازها:
- Node.js >= 20
- MySQL >= 8.0

### ۱. راه‌اندازی MySQL

```bash
# ایجاد دیتابیس
mysql -u root -p < backend/src/db/migrations/0001_init.sql
```

### ۲. راه‌اندازی Backend

```bash
cd backend

# کپی فایل محیطی
cp .env.example .env
# ویرایش .env و تنظیم مقادیر DB و JWT

# نصب وابستگی‌ها
npm install

# اجرا در محیط توسعه
npm run dev

# بارگذاری داده‌های اولیه
npm run seed
```

سرور روی `http://localhost:4000` اجرا می‌شود.

### ۳. راه‌اندازی Frontend (سایت اصلی)

```bash
cd frontend

# کپی محیط
cp .env.local.example .env.local

# نصب
npm install

# اجرا
npm run dev
```

سایت روی `http://localhost:3000` اجرا می‌شود.

### ۴. راه‌اندازی Admin Panel

```bash
cd admin

# نصب
npm install

# اجرا
npm run dev -- --port 3001
```

پنل ادمین روی `http://localhost:3001` اجرا می‌شود.

## 🔑 دسترسی پیش‌فرض (پس از seed)

| نقش | ایمیل | رمز عبور |
|-----|-------|---------|
| ابر مدیر | admin@digiscript.ir | Admin@123456 |
| کاربر آزمایشی | user@example.com | User@123456 |

## 📡 API Endpoints

### احراز هویت (`/api/auth`)
- `POST /register` - ثبت‌نام
- `POST /login` - ورود
- `POST /refresh` - تجدید توکن
- `POST /logout` - خروج
- `GET /verify-email/:token` - تایید ایمیل
- `POST /forgot-password` - بازیابی رمز
- `POST /reset-password` - تغییر رمز
- `GET /me` - اطلاعات کاربر جاری

### محصولات (`/api/products`)
- `GET /` - لیست محصولات (فیلتر، جستجو، صفحه‌بندی)
- `GET /:slug` - جزئیات محصول
- `POST /` - ایجاد محصول (ادمین)
- `PUT /:id` - ویرایش محصول (ادمین)
- `DELETE /:id` - حذف محصول (ادمین)

### دسته‌بندی‌ها (`/api/categories`)
- `GET /` - همه دسته‌بندی‌ها
- `GET /:slug` - دسته‌بندی خاص
- `POST /` - ایجاد (ادمین)
- `PUT /:id` - ویرایش (ادمین)
- `DELETE /:id` - حذف (ادمین)

### سفارش‌ها (`/api/orders`)
- `POST /` - ثبت سفارش (کاربر)
- `GET /my` - سفارش‌های کاربر
- `GET /:id` - جزئیات سفارش
- `GET /` - همه سفارش‌ها (ادمین)

### دانلودها (`/api/downloads`)
- `POST /generate/:fileId` - ایجاد لینک دانلود موقت
- `GET /file/:token` - دانلود فایل با توکن
- `GET /my` - تاریخچه دانلود

### لایسنس‌ها (`/api/licenses`)
- `GET /my` - لایسنس‌های کاربر
- `GET /verify/:key` - تایید کلید لایسنس

### تیکت‌ها (`/api/tickets`)
- `POST /` - ایجاد تیکت
- `GET /my` - تیکت‌های کاربر
- `GET /:id` - جزئیات تیکت
- `POST /:id/reply` - پاسخ به تیکت
- `PATCH /:id/close` - بستن تیکت
- `GET /` - همه تیکت‌ها (ادمین)

### کاربران (`/api/users`)
- `GET /me` - پروفایل
- `PUT /me` - ویرایش پروفایل
- `GET /` - همه کاربران (ادمین)
- `GET /:id` - کاربر خاص (ادمین)
- `PUT /:id` - ویرایش کاربر (ادمین)

### ادمین (`/api/admin`)
- `GET /dashboard` - آمار داشبورد
- `GET /logs` - لاگ‌های سیستم
- `GET /settings` - تنظیمات
- `PUT /settings/:key` - بروزرسانی تنظیمات

### آپلود (`/api/uploads`)
- `POST /images/product/:productId` - آپلود تصویر محصول
- `POST /files/product/:productId` - آپلود فایل محصول
- `DELETE /images/:imageId` - حذف تصویر
- `DELETE /files/:fileId` - حذف فایل

## 🔒 امنیت

- **JWT** با access token کوتاه‌مدت (15 دقیقه) و refresh token (7 روز)
- **RBAC** - کنترل دسترسی مبتنی بر نقش
- **Rate Limiting** - محدودیت ۱۰۰ درخواست در دقیقه
- **Helmet** - هدرهای امنیتی
- **CORS** - محدود به دامنه‌های مجاز
- **دانلود امن** - توکن موقت با انقضای ۱ ساعت، حداکثر ۳ بار
- **bcrypt** - هش رمز عبور با salt rounds 12
- **Zod** - اعتبارسنجی ورودی‌ها
- **لاگ فعالیت** - ثبت تمام رویدادهای مهم

## 🌐 ویژگی‌های UI

- **RTL کامل** - راست‌به‌چپ برای زبان فارسی
- **فونت Vazirmatn** - فونت فارسی حرفه‌ای
- **Dark Theme** - تم تاریک مدرن
- **Responsive** - موبایل، تبلت، دسکتاپ
- **Animations** - انیمیشن‌های نرم با CSS
- **Glass Morphism** - افکت شیشه‌ای مدرن

## 📦 صفحات فرانت‌اند

### سایت عمومی:
- `/` - صفحه اصلی
- `/products` - لیست محصولات با فیلتر
- `/products/[slug]` - جزئیات محصول
- `/categories/[slug]` - دسته‌بندی
- `/search` - جستجو
- `/about` - درباره ما
- `/contact` - تماس
- `/faq` - سوالات متداول
- `/login` - ورود
- `/register` - ثبت‌نام

### داشبورد کاربر:
- `/dashboard` - خلاصه
- `/dashboard/orders` - سفارش‌ها
- `/dashboard/downloads` - دانلودها
- `/dashboard/licenses` - لایسنس‌ها
- `/dashboard/tickets` - تیکت‌ها
- `/dashboard/profile` - پروفایل

### پنل ادمین:
- `/dashboard` - داشبورد با آمار
- `/dashboard/products` - مدیریت محصولات
- `/dashboard/products/new` - محصول جدید
- `/dashboard/categories` - دسته‌بندی‌ها
- `/dashboard/users` - کاربران
- `/dashboard/orders` - سفارش‌ها
- `/dashboard/tickets` - تیکت‌ها
- `/dashboard/settings` - تنظیمات
- `/dashboard/logs` - لاگ‌های سیستم
