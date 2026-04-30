import { v4 as uuidv4 } from 'uuid';
import { ProductsRepository } from './products.repository';
import { CategoriesRepository } from '../categories/categories.repository';

export class ProductsService {
  private repo: ProductsRepository;
  private categoriesRepo: CategoriesRepository;

  constructor() {
    this.repo = new ProductsRepository();
    this.categoriesRepo = new CategoriesRepository();
  }

  async getProducts(opts: {
    page: number;
    limit: number;
    search?: string;
    categoryId?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { rows, total } = await this.repo.findAll(opts);

    const productsWithDetails = await Promise.all(
      rows.map(async (product: any) => {
        const [images, cats] = await Promise.all([
          this.repo.getImages(product.id),
          this.repo.getCategories(product.id),
        ]);
        return {
          ...product,
          images,
          categories: cats.map((c: any) => c.category),
        };
      })
    );

    return { products: productsWithDetails, total };
  }

  async getProductBySlug(slug: string) {
    const product = await this.repo.findBySlug(slug);
    if (!product) throw new Error('محصول یافت نشد');

    await this.repo.incrementViewCount(product.id);

    const [images, categories, files] = await Promise.all([
      this.repo.getImages(product.id),
      this.repo.getCategories(product.id),
      this.repo.getFiles(product.id),
    ]);

    return {
      ...product,
      images,
      categories: categories.map((c: any) => c.category),
      files: files.map((f: any) => ({ id: f.id, version: f.version, fileName: f.fileName })),
    };
  }

  async getProductById(id: string) {
    const product = await this.repo.findById(id);
    if (!product) throw new Error('محصول یافت نشد');

    const [images, categories, files] = await Promise.all([
      this.repo.getImages(product.id),
      this.repo.getCategories(product.id),
      this.repo.getFiles(product.id),
    ]);

    return { ...product, images, categories: categories.map((c: any) => c.category), files };
  }

  async createProduct(data: {
    title: string;
    slug: string;
    shortDescription: string;
    fullDescription: string;
    features?: string[];
    price: string;
    supportPrice?: string;
    status?: 'draft' | 'published' | 'archived';
    demoUrl?: string;
    version?: string;
    tags?: string[];
    categoryIds?: string[];
    metaTitle?: string;
    metaDescription?: string;
  }) {
    const existing = await this.repo.findBySlug(data.slug);
    if (existing) throw new Error('محصولی با این اسلاگ قبلاً وجود دارد');

    const id = uuidv4();
    await this.repo.create({
      id,
      title: data.title,
      slug: data.slug,
      shortDescription: data.shortDescription,
      fullDescription: data.fullDescription,
      features: data.features ?? [],
      price: data.price,
      supportPrice: data.supportPrice ?? '0',
      status: data.status ?? 'draft',
      demoUrl: data.demoUrl,
      version: data.version ?? '1.0.0',
      tags: data.tags ?? [],
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
    });

    if (data.categoryIds && data.categoryIds.length > 0) {
      await this.repo.setCategories(id, data.categoryIds);
    }

    return this.getProductById(id);
  }

  async updateProduct(
    id: string,
    data: Partial<{
      title: string;
      slug: string;
      shortDescription: string;
      fullDescription: string;
      features: string[];
      price: string;
      supportPrice: string;
      status: 'draft' | 'published' | 'archived';
      demoUrl: string;
      version: string;
      tags: string[];
      categoryIds: string[];
      metaTitle: string;
      metaDescription: string;
    }>
  ) {
    const product = await this.repo.findById(id);
    if (!product) throw new Error('محصول یافت نشد');

    if (data.slug && data.slug !== product.slug) {
      const existing = await this.repo.findBySlug(data.slug);
      if (existing) throw new Error('محصولی با این اسلاگ قبلاً وجود دارد');
    }

    const { categoryIds, ...productData } = data;
    await this.repo.update(id, productData as any);

    if (categoryIds) {
      await this.repo.setCategories(id, categoryIds);
    }

    return this.getProductById(id);
  }

  async deleteProduct(id: string) {
    const product = await this.repo.findById(id);
    if (!product) throw new Error('محصول یافت نشد');
    await this.repo.delete(id);
  }
}
