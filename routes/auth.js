const authController = require('../controllers/authController');
const uploadImage = require('../middlewares/uploadFile');
const verify = require('../middlewares/verifyToken');


const express = require('express');
const router = express.Router();

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

// sign up
router.post('/signup', uploadImage.single('pic'), authController.SignUp);

// log in
router.post('/login', authController.LogIn);

// forget password
router.post('/forget-password', authController.ForgetPassword);


// reset password
router.post('/reset-password/:hash', authController.ResetPassword);
// log out
router.post('/logout', verify, authController.LogOut);
module.exports = router;
