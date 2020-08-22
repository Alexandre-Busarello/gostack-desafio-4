import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);
    if (!customer) {
      throw new AppError('Customer not found');
    }

    const invalidProduct = products.find(
      findInvalidProduct => !findInvalidProduct.quantity,
    );
    if (invalidProduct) {
      throw new AppError('Order product must have quantity');
    }

    const productsList = await this.productsRepository.findAllById(products);
    const orderProducts = productsList.map(product => {
      const orderProduct = products.find(
        productById => productById.id === product.id,
      );

      if (!orderProduct) {
        throw new AppError('Product not found');
      }

      if (orderProduct.quantity > product.quantity) {
        throw new AppError('Product has insufficient quantities');
      }

      return {
        product_id: product.id,
        price: product.price,
        quantity: orderProduct.quantity,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: orderProducts,
    });

    const productsToUpdateQuantity = productsList.map(product => {
      const orderProduct = orderProducts.find(
        orderProductFind => orderProductFind.product_id === product.id,
      );
      return {
        id: product.id,
        quantity: product.quantity - (orderProduct?.quantity || 0),
      };
    });

    await this.productsRepository.updateQuantity(productsToUpdateQuantity);

    return order;
  }
}

export default CreateOrderService;
