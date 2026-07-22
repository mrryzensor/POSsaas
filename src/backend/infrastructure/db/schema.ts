import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const tenants = sqliteTable('tenants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  createdAt: text('created_at').notNull(),
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull().default('123456'),
  role: text('role').notNull().default('ADMIN'), // ADMIN, MANAGER, CASHIER
  canResetPassword: integer('can_reset_password', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
});

export const organizations = sqliteTable('organizations', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  type: text('type').notNull(), // REGION, BRANCH, POS
  parentId: text('parent_id'),
  createdAt: text('created_at').notNull(),
});

export const sellableItems = sqliteTable('sellable_items', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  sku: text('sku').notNull(),
  price: real('price').notNull(),
  type: text('type').notNull(), // 'PHYSICAL' | 'SERVICE'
  stock: integer('stock').notNull().default(0),
  durationMin: integer('duration_min').default(0), // for services
  category: text('category').notNull().default('General'),
  createdAt: text('created_at').notNull(),
});

export const salesOrders = sqliteTable('sales_orders', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  userEmail: text('user_email').notNull(),
  total: real('total').notNull(),
  paymentMethod: text('payment_method').notNull(), // CASH, CARD, TRANSFER
  status: text('status').notNull().default('COMPLETED'),
  createdAt: text('created_at').notNull(),
});

export const orderLines = sqliteTable('order_lines', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => salesOrders.id),
  itemId: text('item_id').notNull().references(() => sellableItems.id),
  itemName: text('item_name').notNull(),
  itemType: text('item_type').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  subtotal: real('subtotal').notNull(),
});
