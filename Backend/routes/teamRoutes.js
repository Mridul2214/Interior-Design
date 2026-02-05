const express = require('express');
const {
    getTeams,
    getTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    addMember,
    removeMember
} = require('../controllers/teamController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getTeams)
    .post(authorize('Super Admin', 'Admin', 'Manager'), createTeam);

router.route('/:id')
    .get(getTeam)
    .put(authorize('Super Admin', 'Admin', 'Manager'), updateTeam)
    .delete(authorize('Super Admin', 'Admin'), deleteTeam);

router.post('/:id/members', authorize('Super Admin', 'Admin', 'Manager'), addMember);
router.delete('/:id/members/:userId', authorize('Super Admin', 'Admin', 'Manager'), removeMember);

module.exports = router;
