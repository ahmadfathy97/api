//models
let Categories = require('../models/categories');
let Posts = require('../models/posts');

let controller = {}
controller.AllCategories = (req, res)=>{
  if(req.user){
    Categories.find({}, (err, categories)=>{
      if (err) res.json({msg: 'there is an error'});
      categories.forEach((category)=>{
        category.category_pic = `http://${req.hostname}/${category.category_pic}`;
        console.log(category.category_pic);
      })
      console.log(categories);
      res.json(categories);
    });
  } else {
    res.json({msg: 'so cute ☺'});
  }
};

controller.SpecificCategory = (req, res)=>{
  if(req.user){
    Categories.findOne({category_name: req.params.name}, (err, category)=>{
      if (err) res.json({msg: 'there is an error'});
      Posts.find({category_id: category._id})
      .populate('user_id')
      .populate('category_id')
      .populate({
        path: 'comments',
        populate: {
          path: 'user_id',
          select: ['username', '_id', 'pic']
        }
      })
      .exec((err, posts)=>{
        category.category_pic = `http://${req.hostname}/${category.category_pic}`;
        res.json({category: category, posts: posts});
      })
    });
  } else {
    res.json({msg: 'so cute ☺'});
  }
};

controller.AddCategory = (req, res)=>{
  if(req.user){
    let newCategory = {};
    console.log('fdfds', req.body);
    newCategory.category_name = req.body.category_name;
    newCategory.category_pic = req.file.path.replace('public', '');
    newCategory.category_info = req.body.category_info;
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
};

controller.EditCategoty = (req, res)=>{
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
}

controller.DeletCategory = (req, res)=>{
  if(req.user){
    Categories.remove({_id: req.params._id}, (err)=>{
      if(err) res.json({msg: err});
      else res.json({msg: 'category deleted'});
    });
  } else {
    res.json({msg: 'so cute ☺'});
  }
}

module.exports = controller;
