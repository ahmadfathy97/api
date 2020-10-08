const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/commentsController');

const verify = require('../middlewares/verifyToken');
// delete specific comment
router.delete('/:comment_id', verify, commentsController.DeleteComment);

module.exports = router;
