import express from 'express';
import cors from 'cors';
import { db, initDb } from './infrastructure/db/connection.js';
import * as schema from './infrastructure/db/schema.js';
import { eq } from 'drizzle-orm';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize SQLite DB
initDb();

const DEFAULT_TENANT = 'tenant_default';

// --- AUTH & LOGIN ROUTES ---
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.select().from(schema.users).where(eq(schema.users.email, email)).get();

    if (!user || user.passwordHash !== password) {
      res.status(401).json({ error: 'Credenciales inválidas. Verifica tu correo y contraseña.' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      canResetPassword: Boolean(user.canResetPassword),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/me', async (req, res) => {
  try {
    const user = await db.select().from(schema.users).where(eq(schema.users.email, 'daviex14@gmail.com')).get();
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- CATALOG (SellableItems) ROUTE ---
app.get('/api/items', async (req, res) => {
  try {
    const items = await db.select().from(schema.sellableItems).where(eq(schema.sellableItems.tenantId, DEFAULT_TENANT)).all();
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const { name, sku, price, type, stock, durationMin, category } = req.body;
    const newItem = {
      id: `item_${Date.now()}`,
      tenantId: DEFAULT_TENANT,
      name,
      sku: sku || `SKU-${Date.now().toString().slice(-4)}`,
      price: parseFloat(price),
      type: type || 'PHYSICAL',
      stock: parseInt(stock) || 0,
      durationMin: parseInt(durationMin) || 0,
      category: category || 'General',
      createdAt: new Date().toISOString(),
    };
    await db.insert(schema.sellableItems).values(newItem);
    res.status(201).json(newItem);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, price, type, stock, durationMin, category } = req.body;
    await db.update(schema.sellableItems).set({
      name,
      sku,
      price: parseFloat(price),
      type,
      stock: parseInt(stock) || 0,
      durationMin: parseInt(durationMin) || 0,
      category: category || 'General',
    }).where(eq(schema.sellableItems.id, id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(schema.sellableItems).where(eq(schema.sellableItems.id, id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- USERS MANAGEMENT ROUTES ---
app.get('/api/users', async (req, res) => {
  try {
    const userList = await db.select().from(schema.users).where(eq(schema.users.tenantId, DEFAULT_TENANT)).all();
    res.json(userList.map(u => ({ ...u, canResetPassword: Boolean(u.canResetPassword) })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { email, name, role, password, canResetPassword } = req.body;
    const newUser = {
      id: `user_${Date.now()}`,
      tenantId: DEFAULT_TENANT,
      email,
      name,
      passwordHash: password || '123456',
      role: role || 'CASHIER',
      canResetPassword: Boolean(canResetPassword),
      createdAt: new Date().toISOString(),
    };
    await db.insert(schema.users).values(newUser);
    res.status(201).json(newUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    await db.update(schema.users).set({ passwordHash: newPassword }).where(eq(schema.users.id, id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id/toggle-reset-permission', async (req, res) => {
  try {
    const { id } = req.params;
    const { canResetPassword } = req.body;
    await db.update(schema.users).set({ canResetPassword: Boolean(canResetPassword) }).where(eq(schema.users.id, id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(schema.users).where(eq(schema.users.id, id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// --- HIERARCHY / ORGANIZATIONS ROUTE ---
app.get('/api/organizations', async (req, res) => {
  try {
    const orgs = await db.select().from(schema.organizations).where(eq(schema.organizations.tenantId, DEFAULT_TENANT)).all();
    res.json(orgs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/organizations', async (req, res) => {
  try {
    const { name, type, parentId } = req.body;
    const newOrg = {
      id: `org_${Date.now()}`,
      tenantId: DEFAULT_TENANT,
      name,
      type: type || 'BRANCH',
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
    };
    await db.insert(schema.organizations).values(newOrg);
    res.status(201).json(newOrg);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- SALES & ORDERS ROUTE ---
app.get('/api/sales', async (req, res) => {
  try {
    const orders = await db.select().from(schema.salesOrders).where(eq(schema.salesOrders.tenantId, DEFAULT_TENANT)).all();
    const ordersWithLines = await Promise.all(
      orders.map(async (order) => {
        const lines = await db.select().from(schema.orderLines).where(eq(schema.orderLines.orderId, order.id)).all();
        return { ...order, lines };
      })
    );
    res.json(ordersWithLines);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sales', async (req, res) => {
  try {
    const { organizationId, paymentMethod, items, userEmail } = req.body;

    if (!items || !items.length) {
      res.status(400).json({ error: 'El carrito de ventas no puede estar vacío.' });
      return;
    }

    let total = 0;
    const orderId = `ord_${Date.now()}`;
    const linesToInsert = [];

    for (const item of items) {
      const lineSubtotal = item.price * item.quantity;
      total += lineSubtotal;

      linesToInsert.push({
        id: `line_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        orderId,
        itemId: item.id,
        itemName: item.name,
        itemType: item.type,
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: lineSubtotal,
      });

      // Deduct stock if physical product
      if (item.type === 'PHYSICAL') {
        const existing = await db.select().from(schema.sellableItems).where(eq(schema.sellableItems.id, item.id)).get();
        if (existing) {
          const newStock = Math.max(0, existing.stock - item.quantity);
          await db.update(schema.sellableItems).set({ stock: newStock }).where(eq(schema.sellableItems.id, item.id));
        }
      }
    }

    const newOrder = {
      id: orderId,
      tenantId: DEFAULT_TENANT,
      organizationId: organizationId || 'org_pos_1',
      userEmail: userEmail || 'daviex14@gmail.com',
      total,
      paymentMethod: paymentMethod || 'CASH',
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    };

    await db.insert(schema.salesOrders).values(newOrder);
    for (const line of linesToInsert) {
      await db.insert(schema.orderLines).values(line);
    }

    res.status(201).json({ order: newOrder, lines: linesToInsert });
  } catch (err: any) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Monolito Modular POS SaaS activo en http://localhost:${PORT}`);
});
