const express = require('express');
const router = express.Router();
const SearchController = require('../controllers/searchController');


const verify = require('../middlewares/verifyToken');
//search for any user matches the query
router.get('/', verify, SearchController.SearchForUsers);


module.exports = router;
