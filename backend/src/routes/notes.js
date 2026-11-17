const router = require('express').Router();
const { updateNote, deleteNote, getFollowUps } = require('../controllers/notesController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/follow-ups', getFollowUps);
router.patch('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
