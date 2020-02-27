<<<<<<< HEAD
const jwt = require('jsonwebtoken');
module.exports = function(req, res, next){
  const token = req.header('auth_token');
  if(!token) return res.status(401).json({msg:'Access Denied'});
  try{
    const verified = jwt.verify(token, process.env.SECRET_TOKEN);
    req.user = verified;
    next();
  }catch(err){
    res.status(400).json({msg: 'Invalid Token'});
  }
}
=======
const jwt = require('jsonwebtoken');
module.exports = function(req, res, next){
  const token = req.header('auth_token');
  if(!token) return res.status(401).json({msg:'Access Denied'});
  try{
    const verified = jwt.verify(token, process.env.SECRET_TOKEN);
    req.user = verified;
    next();
  }catch(err){
    res.status(400).json({msg: 'Invalid Token'});
  }
}
>>>>>>> e6396d52dce6e5893405328c76c424b9de96d16f
