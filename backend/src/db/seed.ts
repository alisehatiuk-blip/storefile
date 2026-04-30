import { v4 as uuidv4 } from 'uuid';
import { createDbConnection, getDb } from './index';
import { users, categories, products, productCategories, settings } from './schema';
import { hashPassword } from '../utils/crypto';

async function seed() {
  await createDbConnection();
  const db = getDb();

  console.log('🌱 Starting database seed...');

  // Admin user
  const adminId = uuidv4();
  const adminPassword = await hashPassword('Admin@123456');
  await db.insert(users).ignore().values({
    id: adminId,
    email: 'admin@digiscript.ir',
    password: adminPassword,
    firstName: 'مدیر',
    lastName: 'سیستم',
    role: 'super_admin',
    isActive: true,
    isEmailVerified: true,
  });

  // Test user
  const userId = uuidv4();
  const userPassword = await hashPassword('User@123456');
  await db.insert(users).ignore().values({
    id: userId,
    email: 'user@example.com',
    password: userPassword,
    firstName: 'علی',
    lastName: 'محمدی',
    role: 'user',
    isActive: true,
    isEmailVerified: true,
  });

  console.log('✅ Users created');

  // Categories
  const catIds = {
    scripts: uuidv4(),
    saas: uuidv4(),
    automation: uuidv4(),
    business: uuidv4(),
    web: uuidv4(),
  };

  const categoriesData = [
    { id: catIds.scripts, name: 'اسکریپت‌ها', slug: 'scripts', description: 'اسکریپت‌های کاربردی برای اتوماسیون و توسعه', sortOrder: 1 },
    { id: catIds.saas, name: 'میکرو SaaS', slug: 'micro-saas', description: 'ابزارهای SaaS آماده برای استقرار', sortOrder: 2 },
    { id: catIds.automation, name: 'اتوماسیون', slug: 'automation', description: 'ابزارهای اتوماسیون کسب‌وکار', sortOrder: 3 },
    { id: catIds.business, name: 'راهکارهای کسب‌وکار', slug: 'business-solutions', description: 'راهکارهای جامع کسب‌وکار', sortOrder: 4 },
    { id: catIds.web, name: 'توسعه وب', slug: 'web-development', description: 'ابزارها و قالب‌های توسعه وب', sortOrder: 5 },
  ];

  for (const cat of categoriesData) {
    await db.insert(categories).ignore().values({ ...cat, isActive: true });
  }

  console.log('✅ Categories created');

  // Products
  const products_data = [
    {
      id: uuidv4(),
      title: 'ربات تلگرام مدیریت فروشگاه',
      slug: 'telegram-shop-bot',
      shortDescription: 'ربات تلگرام کامل برای مدیریت فروشگاه آنلاین با قابلیت پرداخت، موجودی و گزارش‌گیری',
      fullDescription: `<h2>ربات تلگرام مدیریت فروشگاه</h2>
<p>این ربات حرفه‌ای تلگرام به شما امکان می‌دهد یک فروشگاه آنلاین کامل را مستقیماً در تلگرام مدیریت کنید.</p>
<h3>ویژگی‌های اصلی:</h3>
<ul>
<li>مدیریت محصولات و موجودی</li>
<li>پرداخت آنلاین (زرین‌پال و IDPay)</li>
<li>گزارش‌گیری جامع</li>
<li>مدیریت سفارشات</li>
</ul>`,
      features: ['پرداخت آنلاین', 'مدیریت موجودی', 'گزارش‌گیری', 'پشتیبانی ۲۴/۷', 'نصب آسان'],
      price: '490000',
      supportPrice: '150000',
      status: 'published' as const,
      demoUrl: 'https://t.me/demo_shop_bot',
      version: '2.3.1',
      tags: ['تلگرام', 'ربات', 'فروشگاه', 'پایتون'],
      catId: catIds.scripts,
    },
    {
      id: uuidv4(),
      title: 'سیستم مدیریت لید CRM',
      slug: 'crm-lead-management',
      shortDescription: 'سیستم CRM سبک برای مدیریت لیدها، مشتریان و پایپ‌لاین فروش',
      fullDescription: `<h2>سیستم مدیریت لید CRM</h2>
<p>یک CRM ساده و کارآمد برای تیم‌های فروش کوچک تا متوسط.</p>
<h3>قابلیت‌ها:</h3>
<ul>
<li>پایپ‌لاین کانبان</li>
<li>پیگیری خودکار ایمیل</li>
<li>داشبورد تحلیلی</li>
<li>یادآوری وظایف</li>
</ul>`,
      features: ['پایپ‌لاین فروش', 'مدیریت تماس‌ها', 'گزارش‌های پیشرفته', 'API کامل', 'نصب self-hosted'],
      price: '890000',
      supportPrice: '250000',
      status: 'published' as const,
      version: '1.5.0',
      tags: ['CRM', 'فروش', 'مدیریت', 'Next.js'],
      catId: catIds.saas,
    },
    {
      id: uuidv4(),
      title: 'اسکریپت ارسال بالک ایمیل',
      slug: 'bulk-email-sender',
      shortDescription: 'ابزار حرفه‌ای ارسال ایمیل انبوه با قابلیت زمان‌بندی و ردیابی باز شدن ایمیل',
      fullDescription: `<h2>اسکریپت ارسال بالک ایمیل</h2>
<p>ارسال هزاران ایمیل با یک کلیک و ردیابی نرخ باز شدن.</p>`,
      features: ['ارسال SMTP', 'زمان‌بندی', 'ردیابی', 'تمپلیت HTML', 'خروجی CSV'],
      price: '290000',
      supportPrice: '100000',
      status: 'published' as const,
      version: '3.0.0',
      tags: ['ایمیل', 'اتوماسیون', 'بازاریابی', 'پایتون'],
      catId: catIds.automation,
    },
    {
      id: uuidv4(),
      title: 'داشبورد تحلیلی وب‌سایت',
      slug: 'website-analytics-dashboard',
      shortDescription: 'داشبورد مستقل تحلیل آمار وب‌سایت بدون نیاز به Google Analytics',
      fullDescription: `<h2>داشبورد تحلیلی وب‌سایت</h2>
<p>کنترل کامل آمار سایت خود را در دست بگیرید.</p>`,
      features: ['ردیابی بازدید', 'نقشه حرارتی', 'قیف تبدیل', 'GDPR سازگار', 'سرعت بالا'],
      price: '690000',
      supportPrice: '200000',
      status: 'published' as const,
      version: '2.1.0',
      tags: ['آنالیتیکس', 'آمار', 'داشبورد', 'Vue.js'],
      catId: catIds.web,
    },
    {
      id: uuidv4(),
      title: 'سیستم صدور فاکتور آنلاین',
      slug: 'online-invoice-system',
      shortDescription: 'سیستم کامل صدور و مدیریت فاکتور با پشتیبانی از PDF و ارسال ایمیل',
      fullDescription: `<h2>سیستم صدور فاکتور آنلاین</h2>
<p>صدور فاکتور حرفه‌ای در چند ثانیه.</p>`,
      features: ['فاکتور PDF', 'ارسال ایمیل', 'مدیریت مشتریان', 'گزارش مالی', 'چند ارز'],
      price: '590000',
      supportPrice: '180000',
      status: 'published' as const,
      version: '1.8.2',
      tags: ['فاکتور', 'حسابداری', 'کسب‌وکار', 'Laravel'],
      catId: catIds.business,
    },
  ];

  for (const product of products_data) {
    const { catId, ...productData } = product;
    await db.insert(products).ignore().values(productData);
    await db.insert(productCategories).ignore().values({
      productId: product.id,
      categoryId: catId,
    });
  }

  console.log('✅ Products created');

  // Settings
  const defaultSettings = [
    { id: uuidv4(), key: 'site_name', value: 'دیجی‌اسکریپت', type: 'string' as const, group: 'general', label: 'نام سایت' },
    { id: uuidv4(), key: 'site_description', value: 'فروشگاه اسکریپت‌های حرفه‌ای و ابزارهای کسب‌وکار', type: 'string' as const, group: 'general', label: 'توضیحات سایت' },
    { id: uuidv4(), key: 'contact_email', value: 'info@digiscript.ir', type: 'string' as const, group: 'contact', label: 'ایمیل تماس' },
    { id: uuidv4(), key: 'contact_phone', value: '021-12345678', type: 'string' as const, group: 'contact', label: 'تلفن تماس' },
    { id: uuidv4(), key: 'currency', value: 'تومان', type: 'string' as const, group: 'payment', label: 'واحد پول' },
    { id: uuidv4(), key: 'maintenance_mode', value: 'false', type: 'boolean' as const, group: 'general', label: 'حالت تعمیر' },
  ];

  for (const setting of defaultSettings) {
    await db.insert(settings).ignore().values(setting);
  }

  console.log('✅ Settings created');
  console.log('\n✨ Seed completed successfully!');
  console.log('👤 Admin: admin@digiscript.ir / Admin@123456');
  console.log('👤 User: user@example.com / User@123456');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
