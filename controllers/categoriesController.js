//models
let Categories = require('../models/categories');
let Posts = require('../models/posts');

let controller = {}
controller.AllCategories = (req, res)=>{
  Categories.find({}, (err, categories)=>{
    if (err) res.json({success: false, msg: 'something went wrong'});
    else if(categories){
      categories.forEach((category)=>{
        category.category_pic = `https://${req.hostname}/${category.category_pic}`;
      })
      res.json({success: true, categories});
    }
  });
};

controller.SpecificCategory = (req, res)=>{
  Categories.findOne({category_name: req.params.name}, (err, category)=>{
    if (err) res.json({success: false, msg: 'something went wrong'});
    else {
      Posts.find({category_id: category._id})
      .limit(100)
      .select('createdAt created_at title')
      .sort({'createdAt': -1})
      .exec((err, posts)=>{
        category.category_pic = `https://${req.hostname}/${category.category_pic}`;
        res.json({success: true, category: category, posts: posts || []});
      })
    }
  });
};

// controller.AddCategory = (req, res)=>{
//   let newCategory = {};
//   newCategory.category_name = req.body.category_name;
//   newCategory.category_pic = req.file.path.replace('public', '');
//   newCategory.category_info = req.body.category_info;
//   Categories(newCategory).save((err)=>{
//     if (err) {
//       res.json({success: false, msg: 'category not created'});
//     } else{
//       res.json({success: true, msg: 'category created'});
//     }
//   });
// };

// controller.EditCategoty = (req, res)=>{
//   Categories.findOneAndUpdate(
//     {_id: req.params._id},
//     {
//       $set:{
//         category_name: req.body.name,
//         category_pic: req.body.pic,
//         category_info: req.body.info
//       }
//     },
//     err => {
//       if(err) res.json({success: false, msg: 'something went wrong'});
//       else res.json({success: true, msg: 'category updated'});
//     }
//   )
// }

// controller.DeletCategory = (req, res)=>{
//   Categories.deleteOne({_id: req.params._id}, (err)=>{
//     if(err) res.json({success: false, msg: 'something went wrong'});
//     else res.json({success: true, msg: 'category deleted'});
//   });
// }

module.exports = controller;
