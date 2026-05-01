const express = require('express');
const { queryAI, getSuggestion } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/query', queryAI);
router.post('/suggest', getSuggestion);

module.exports = router;
