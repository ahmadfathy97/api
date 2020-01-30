const express = require('express');
const router = express.Router();
//models
let Categories = require('../models/categories');

const verify = require('../verifyToken');
router.get('/', verify, (req, res)=>{
    Categories.find({}, (err, categories)=>{
      if (err) console.log(err);
      res.json(categories);
    });
});
router.get('/', verify,(req, res)=>{
  if(req.user){
    Categories.find({}, (err, categories)=>{
      if (err) res.json({msg: 'there is an error'});
      res.json(categories);
    });
  } else {
    res.json({msg: 'so cute ☺'});
  }
});

router.get('/:id', verify,(req, res)=>{
  if(req.user){
    Categories.findById(req.params.id, (err, category)=>{
      if (err) res.json({msg: 'there is an error'});
      res.json(category);
    });
  } else {
    res.json({msg: 'so cute ☺'});
  }
});

router.post('/', verify, (req, res)=>{
  if(req.user){
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
    });
  } else {
    res.json({msg: 'so cute ☺'});
  }
});

router.put('/:id', verify, (req, res)=>{
  if(req.user){
    console.log(req.body);
    Categories.findOneAndUpdate(
      {_id: req.params._id},
      {
        $set:{
          category_name: req.body.name,
          category_pic: req.body.pic,
          category_info: req.body.info
        }
      },
      err => {
        if(err) res.json({msg: err});
        else res.json({msg: 'category updated'});
      }
    )
  } else {
    res.json({msg: 'so cute ☺'});
  }
});

router.delete('/:id', verify, (req, res)=>{
  if(req.user){
    Categories.remove({_id: req.params._id}, (err)=>{
      if(err) res.json({msg: err});
      else res.json({msg: 'category deleted'});
    });
  } else {
    res.json({msg: 'so cute ☺'});
  }
});

module.exports = router;
