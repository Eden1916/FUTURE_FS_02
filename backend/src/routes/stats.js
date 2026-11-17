const router = require('express').Router();
const { getStats } = require('../controllers/statsController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);
router.get('/', getStats);

module.exports = router;
