const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');
const verify = require('../middlewares/verifyToken');

const cleanText = require('../helpers/cleanText.js');
router.use((req, res, next)=>{
  if(req.body){
    for(field in req.body){
      if(Array.isArray(req.body[field])) {
        req.body[field] = req.body[field].map(item => cleanText.clean(item))
      } else{
        req.body[field] = cleanText.clean(req.body[field]);
      }
    }
  }
  if(req.params){
    for(param in req.params){
      if(Array.isArray(req.params[param])) {
        req.params[param] = req.params[param].map(item => cleanText.clean(item))
      } else{
        req.params[param] = cleanText.clean(req.params[param]);
      }
    }
  }
  if(req.query){
    for(field in req.query){
      if(Array.isArray(req.query[field])) {
        req.query[field] = req.query[field].map(item => cleanText.clean(item))
      } else{
        req.query[field] = cleanText.clean(req.query[field]);
      }
    }
  }
  next()
})
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
