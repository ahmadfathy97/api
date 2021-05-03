const express = require('express');
const router = express.Router();
const uploadImage = require('../middlewares/uploadFile');
const verify = require('../middlewares/verifyToken');

const userController = require('../controllers/userController');
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

router.get('/notifications', verify, userController.FetchAllNotifications);
router.post('/notifications', verify, userController.MakeNotificationsReaded)
router.get('/:id', verify,  userController.SpecificUser);


// verification

router.post('/verify/', userController.VerifyEmail);
// update specific user
router.put('/:id', verify, uploadImage.single('pic'), userController.UpdateUser);


// change password
router.put('/:id/password', verify, userController.ChangePassword);


// delete specific user
router.delete('/:id', verify, userController.DeleteUser);


//follow and unfollow

router.post('/:id/follow', verify, userController.FollowOrUnfollow);

module.exports = router;
