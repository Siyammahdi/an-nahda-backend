import express from 'express';
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getDashboardStats,
  getActivityLogs,
  getSettings,
  updateSetting
} from '../controllers/admin.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Protect all admin routes
// Only users with role 'admin' can access these routes
router.use(protect, authorize('admin'));

// User management routes
router.route('/users')
  .get(getAllUsers)
  .post(createUser);

router.route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

// Dashboard statistics
router.get('/dashboard', getDashboardStats);

// Activity logs
router.get('/activity-logs', getActivityLogs);

// Admin settings
router.route('/settings')
  .get(getSettings);

router.route('/settings/:setting')
  .put(updateSetting);

export default router; 