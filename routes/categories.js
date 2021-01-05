const express = require('express');
const router = express.Router();

const verify = require('../middlewares/verifyToken');
const uploadImages = require('../middlewares/uploadFile');
let categoriesController = require('../controllers/categoriesController');

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

router.get('/', verify, categoriesController.AllCategories);

router.get('/:name', verify, categoriesController.SpecificCategory);

router.post('/', verify, uploadImages.single('pic'), categoriesController.AddCategory);

router.put('/:id', verify, categoriesController.EditCategoty);

router.delete('/:id', verify, categoriesController.DeletCategory);

module.exports = router;
