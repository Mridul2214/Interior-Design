const express = require('express');
const router = express.Router();

const {
    getMembers,
    createMember,
    updateMember,
    deleteMember
} = require('../controllers/teamMemberController');

router.route('/')
    .get(getMembers)
    .post(createMember);

router.route('/:id')
    .patch(updateMember)
    .delete(deleteMember);

module.exports = router;
