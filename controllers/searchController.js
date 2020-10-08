//models
let Users = require('../models/users');

let controller = {};

controller.SearchForUsers = (req, res) => {
  Users.find({username: {$regex : '.*' + req.query.username + '.*', $options: 'i'}})
  .select({username: 1, _id: 1, pic: 1})
  .exec((err, users) => {
    if(err) res.json({msg: err});
    if(users.length){
      let newUsers = [];
      users.forEach((user)=>{
        let newUser = user.toJSON();
        if(newUser.password) delete user.password;
        if(newUser.pic) newUser.pic = `http://${req.hostname}/${newUser.pic}`;
        newUsers.push(newUser);
      });
      res.json({searchResult: newUsers});
    } else {
      res.json({noResults: 'no users matches'});
    }
  });
};

module.exports = controller;
