import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
import path from 'path';

const sqlite = new Database('pos_saas.db');
export const db = drizzle(sqlite, { schema });

export function initDb() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL DEFAULT '123456',
      role TEXT NOT NULL DEFAULT 'ADMIN',
      can_reset_password INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY(tenant_id) REFERENCES tenants(id)
    );

    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      parent_id TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(tenant_id) REFERENCES tenants(id)
    );

    CREATE TABLE IF NOT EXISTS sellable_items (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sku TEXT NOT NULL,
      price REAL NOT NULL,
      type TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      duration_min INTEGER DEFAULT 0,
      category TEXT NOT NULL DEFAULT 'General',
      created_at TEXT NOT NULL,
      FOREIGN KEY(tenant_id) REFERENCES tenants(id)
    );

    CREATE TABLE IF NOT EXISTS sales_orders (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      user_email TEXT NOT NULL,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'COMPLETED',
      created_at TEXT NOT NULL,
      FOREIGN KEY(tenant_id) REFERENCES tenants(id),
      FOREIGN KEY(organization_id) REFERENCES organizations(id)
    );

    CREATE TABLE IF NOT EXISTS order_lines (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      item_name TEXT NOT NULL,
      item_type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY(order_id) REFERENCES sales_orders(id),
      FOREIGN KEY(item_id) REFERENCES sellable_items(id)
    );
  `);

  // Seed default data if not exists
  const now = new Date().toISOString();
  
  const tenantExists = sqlite.prepare('SELECT id FROM tenants WHERE id = ?').get('tenant_default');

  if (!tenantExists) {
    console.log('🌱 Seeding database...');
    sqlite.prepare('INSERT INTO tenants (id, name, code, created_at) VALUES (?, ?, ?, ?)').run(
      'tenant_default', 'Empresa Principal SaaS', 'MAIN_SAAS', now
    );

    // Initial User: daviex14@gmail.com (Password: admin123)
    sqlite.prepare('INSERT INTO users (id, tenant_id, email, name, password_hash, role, can_reset_password, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      'user_daviex', 'tenant_default', 'daviex14@gmail.com', 'Ing. David (Admin)', 'admin123', 'ADMIN', 1, now
    );

    // Organizations (Hierarchy)
    sqlite.prepare('INSERT INTO organizations (id, tenant_id, name, type, parent_id, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
      'org_hq', 'tenant_default', 'Sede Central Bogotá', 'REGION', null, now
    );
    sqlite.prepare('INSERT INTO organizations (id, tenant_id, name, type, parent_id, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
      'org_branch_1', 'tenant_default', 'Sucursal Norte', 'BRANCH', 'org_hq', now
    );
    sqlite.prepare('INSERT INTO organizations (id, tenant_id, name, type, parent_id, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
      'org_pos_1', 'tenant_default', 'Caja Principal 01', 'POS', 'org_branch_1', now
    );

    // Sellable Items (Physical & Services)
    const items = [
      ['prod_1', 'tenant_default', 'Café Espresso Premium 250g', 'PHYS-001', 12.50, 'PHYSICAL', 50, 0, 'Bebidas & Granos', now],
      ['prod_2', 'tenant_default', 'Té Matcha Orgánico', 'PHYS-002', 8.00, 'PHYSICAL', 30, 0, 'Bebidas & Granos', now],
      ['prod_3', 'tenant_default', 'Croissant de Almendras', 'PHYS-003', 4.50, 'PHYSICAL', 15, 0, 'Panadería', now],
      ['serv_1', 'tenant_default', 'Mantenimiento de Barista / Asesoría', 'SERV-001', 45.00, 'SERVICE', 0, 60, 'Servicios Profesionales', now],
      ['serv_2', 'tenant_default', 'Cata Guiada de Café (Per Person)', 'SERV-002', 25.00, 'SERVICE', 0, 45, 'Experiencias', now],
    ];

    const insertItem = sqlite.prepare(`
      INSERT INTO sellable_items (id, tenant_id, name, sku, price, type, stock, duration_min, category, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      insertItem.run(...item);
    }
    console.log('✅ Seed complete with user daviex14@gmail.com');
  }
}
