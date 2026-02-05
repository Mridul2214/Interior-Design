const express = require('express');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getUserStats
} = require('../controllers/userController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(authorize('Super Admin', 'Admin'), getUsers)
    .post(authorize('Super Admin', 'Admin'), createUser);

router.get('/stats', authorize('Super Admin', 'Admin'), getUserStats);

router.route('/:id')
    .get(getUser)
    .put(authorize('Super Admin', 'Admin'), updateUser)
    .delete(authorize('Super Admin'), deleteUser);

module.exports = router;
