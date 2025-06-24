import express from 'express';
import { initiatePayment, validatePayment, handleIPN, updatePaymentStatus, manualPaymentValidation, testSSLCommerzConfig } from '../controllers/payment.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Payment API is working',
    timestamp: new Date().toISOString(),
    sslcommerz_config: {
      store_id: 'nahda6854703f4225b',
      is_sandbox: true
    }
  });
});

// SSLCommerz configuration test endpoint
router.get('/test-config', testSSLCommerzConfig);

// SSLCommerz payment routes
router.post('/sslcommerz/init', initiatePayment);
router.post('/sslcommerz/validate', validatePayment);
router.post('/sslcommerz/ipn', handleIPN);

// Admin-only payment management routes
router.patch('/status', protect, authorize('admin'), updatePaymentStatus);
router.post('/validate', protect, authorize('admin'), manualPaymentValidation);

export default router; 