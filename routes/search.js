const express = require('express');
const router = express.Router();
const SearchController = require('../controllers/searchController');


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
  next()
})
//search for any user matches the query
router.get('/', verify, SearchController.SearchForUsers);


module.exports = router;
