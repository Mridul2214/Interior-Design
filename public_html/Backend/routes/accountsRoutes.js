const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getExpenses, createExpense, updateExpense, getPayments, createPayment, getProjectFinancials, getAccountsStats } = require('../controllers/accountsController');

router.use(protect);

router.route('/expenses')
    .get(getExpenses)
    .post(createExpense);

router.route('/expenses/:id')
    .put(updateExpense);

router.route('/payments')
    .get(getPayments)
    .post(createPayment);

router.route('/project/:projectId/financials')
    .get(getProjectFinancials);

router.route('/stats')
    .get(getAccountsStats);

module.exports = router;
