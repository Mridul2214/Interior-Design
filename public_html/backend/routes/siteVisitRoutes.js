const express = require('express');
const {
    getSiteVisits,
    createSiteVisit,
    getTaskVisits
} = require('../controllers/siteVisitController');

const router = express.Router();
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getSiteVisits)
    .post(createSiteVisit);

router.get('/task/:taskId', getTaskVisits);

module.exports = router;
