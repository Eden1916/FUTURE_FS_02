const router = require('express').Router();
const { getLeads, getLead, createLead, updateLead, deleteLead } = require('../controllers/leadsController');
const { createNote } = require('../controllers/notesController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', getLeads);
router.post('/', createLead);
router.get('/:id', getLead);
router.patch('/:id', updateLead);
router.delete('/:id', deleteLead);

// Notes nested under a lead
router.post('/:leadId/notes', createNote);

module.exports = router;
