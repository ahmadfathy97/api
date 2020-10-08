const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');
const verify = require('../middlewares/verifyToken');

// get all posts
router.get('/', verify, postsController.FetchAll);

// create new post
router.post('/', verify, postsController.AddPost);

router.get('/latest/', verify, postsController.Latest);
// get specific post
router.get('/:id', verify, postsController.SpecificPost);

// get all posts that belong to one user
router.get('/user/:id', verify, postsController.SpecificUserPosts);

// delete specific post
router.delete('/:id', verify, postsController.DeletePost);

// update specific post
router.put('/:id', verify, postsController.UpdatePost);

//like and unlike
router.post('/:id/like', verify, postsController.LikeOrUnlike);

// add comment
router.post('/:id/add-comment', verify, postsController.AddComment);

module.exports = router;
