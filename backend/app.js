import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import brandRoutes from './routes/brand.routes.js';
import supplierRoutes from './routes/supplier.routes.js';
import customerRoutes from './routes/customer.routes.js';
import purchaseRoutes from './routes/purchase.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import saleRoutes from './routes/sale.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import settingRoutes from './routes/setting.routes.js';

// Route imports will be added as modules are built
// import userRoutes from './routes/user.routes.js';
// import reportRoutes from './routes/report.routes.js';
// import auditLogRoutes from './routes/auditLog.routes.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting
app.use(apiLimiter);

// Body parsing
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// API Routes - will be registered as modules are built
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingRoutes);
// app.use('/api/reports', reportRoutes);
// app.use('/api/audit-logs', auditLogRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

export default app;
