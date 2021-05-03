const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/commentsController');

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
// delete specific comment
router.delete('/:comment_id', verify, commentsController.DeleteComment);

module.exports = router;
