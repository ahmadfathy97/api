const express = require('express');
const router = express.Router();
//models
let Categories = require('../models/categories');

router.get('/', (req, res)=>{
    Categories.find({}, (err, categories)=>{
      if (err) console.log(err);
      res.json(categories);
    });
});

router.post('/', (req, res)=>{
  let newCategory = {};
  newCategory.category_name = req.body.name;
  newCategory.category_pic = req.body.pic;
  newCategory.category_info = req.body.info;
  Categories(newCategory).save((err)=>{
    if (err) {
      console.log(err);
      res.json({msg: 'category not created'});
    };
    res.json({msg: 'category created'});
  })

});
module.exports = router;
