const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const auth = require('../middleware/authMiddleware');

// Apply authentication middleware to all billing routes
router.use(auth);

// Invoice routes
router.get('/invoices/:pbxType', billingController.getInvoices);
router.post('/invoices/:pbxType', billingController.generateInvoice);
router.get('/invoices/:pbxType/:invoiceId', billingController.getInvoiceDetails);
router.delete('/invoices/:pbxType/:invoiceId', billingController.deleteInvoice);
router.get('/invoices/:pbxType/:invoiceId/download', billingController.downloadInvoice);

// Payment routes
router.get('/payments/:pbxType', billingController.getPayments);
router.get('/payments/:pbxType/stats', billingController.getPaymentStats);
router.post('/payments/:pbxType/export', billingController.exportPayments);

// Billing export routes
router.post('/export/:pbxType', billingController.exportBillingData);

// Usage tracking routes
router.get('/usage/:pbxType', billingController.getUsageData);
router.get('/usage/:pbxType/stats', billingController.getUsageStats);

module.exports = router; 