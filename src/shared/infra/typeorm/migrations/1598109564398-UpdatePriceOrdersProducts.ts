import { MigrationInterface, QueryRunner } from 'typeorm';

export default class UpdatePriceOrdersProducts1598109564398
  implements MigrationInterface {
  name = 'UpdatePriceOrdersProducts1598109564398';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders_products" DROP COLUMN "price"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "orders_products" ADD "price" numeric(5,2) NOT NULL`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders_products" DROP COLUMN "price"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "orders_products" ADD "price" integer NOT NULL`,
      undefined,
    );
  }
}
