import { v4 as uuidv4 } from 'uuid';
import { OrdersRepository } from './orders.repository';
import { ProductsRepository } from '../products/products.repository';
import { LicensesRepository } from '../licenses/licenses.repository';
import { generateOrderNumber, generateLicenseKey } from '../../utils/crypto';

export class OrdersService {
  private repo: OrdersRepository;
  private productsRepo: ProductsRepository;
  private licensesRepo: LicensesRepository;

  constructor() {
    this.repo = new OrdersRepository();
    this.productsRepo = new ProductsRepository();
    this.licensesRepo = new LicensesRepository();
  }

  async createOrder(
    userId: string,
    items: Array<{ productId: string; includesSupport: boolean }>
  ) {
    // Validate products exist
    const productDetails = await Promise.all(
      items.map(async (item) => {
        const product = await this.productsRepo.findById(item.productId);
        if (!product) throw new Error(`محصول با شناسه ${item.productId} یافت نشد`);
        if (product.status !== 'published') throw new Error(`محصول ${product.title} در دسترس نیست`);
        return { product, includesSupport: item.includesSupport };
      })
    );

    // Calculate total
    let totalAmount = 0;
    for (const { product, includesSupport } of productDetails) {
      totalAmount += parseFloat(product.price);
      if (includesSupport && product.supportPrice) {
        totalAmount += parseFloat(product.supportPrice);
      }
    }

    const orderId = uuidv4();
    const orderNumber = generateOrderNumber();

    await this.repo.create({
      id: orderId,
      orderNumber,
      userId,
      status: 'completed', // Mock payment - auto complete
      totalAmount: totalAmount.toFixed(2),
      paymentMethod: 'mock',
      paymentStatus: 'paid',
      paymentReference: `MOCK-${Date.now()}`,
    });

    // Create order items and licenses
    for (const { product, includesSupport } of productDetails) {
      const itemId = uuidv4();
      const supportExpiresAt = includesSupport
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        : undefined;

      await this.repo.createOrderItem({
        id: itemId,
        orderId,
        productId: product.id,
        productTitle: product.title,
        price: product.price,
        includesSupport,
        supportPrice: includesSupport ? (product.supportPrice ?? '0') : '0',
        supportExpiresAt,
      });

      // Generate license
      await this.licensesRepo.create({
        id: uuidv4(),
        licenseKey: generateLicenseKey(),
        userId,
        productId: product.id,
        orderId,
        status: 'active',
        activatedAt: new Date(),
      });
    }

    return this.getOrderById(orderId);
  }

  async getOrderById(id: string) {
    const order = await this.repo.findById(id);
    if (!order) throw new Error('سفارش یافت نشد');

    const items = await this.repo.getOrderItems(id);
    return { ...order, items };
  }

  async getUserOrders(userId: string) {
    const orders = await this.repo.getUserOrders(userId);
    const ordersWithItems = await Promise.all(
      orders.map(async (order: any) => {
        const items = await this.repo.getOrderItems(order.id);
        return { ...order, items };
      })
    );
    return ordersWithItems;
  }

  async getOrders(opts: { page: number; limit: number; userId?: string; status?: string }) {
    const { rows, total } = await this.repo.findAll(opts);
    const ordersWithItems = await Promise.all(
      rows.map(async (order: any) => {
        const items = await this.repo.getOrderItems(order.id);
        return { ...order, items };
      })
    );
    return { orders: ordersWithItems, total };
  }
}
