const express = require('express');
const router = express.Router();
const uploadImage = require('../middlewares/uploadFile');
const verify = require('../middlewares/verifyToken');

const userController = require('../controllers/userController');

router.get('/notifications', verify, userController.FetchAllNotifications);
router.post('/notifications', verify, userController.MakeNotificationsReaded)
router.get('/:id', verify,  userController.SpecificUser);

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
  next()
})

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
