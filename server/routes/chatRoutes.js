const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

router.post('/message', optionalAuth, chatController.sendMessage);
router.get('/history', authenticateToken, chatController.getChatHistory);

router.get('/:id', authenticateToken, chatController.getChat);
router.delete('/:id', authenticateToken, chatController.deleteChat);
router.delete('/', authenticateToken, chatController.clearAllChats);

module.exports = router;
