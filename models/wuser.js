var mongoose = require('./db');



var wuserSchema = new mongoose.Schema({
  openid: String,
  nickname: String,
  headimgurl: String,
  city: String,
  province: String,
  country: String,
  sex: Number,
  fav: []
}, {
  collection: 'wusers'
});

var wuserModel = mongoose.model('WUser', wuserSchema);


function WUser(wuser) {
  this.openid = wuser.openid;
  this.nickname = wuser.nickname;
  this.headimgurl = wuser.headimgurl;
  this.city = wuser.city;
  this.province = wuser.province;
  this.country = wuser.country;
  this.sex = wuser.sex;
};

module.exports = WUser;

//存储用户信息
WUser.prototype.save = function(callback) {
  //要存入数据库的用户文档
  var wuser = {
    openid: this.openid,
    nickname: this.nickname,
    headimgurl: this.headimgurl,
    city: this.city,
    province: this.city,
    country: this.country,
    sex: this.sex
  };

  var newUser = new wuserModel(wuser);

  newUser.save(function (err, wuser) {
    if (err) {
      return callback(err);
    }
    callback(null, wuser);
  });
};

//读取用户信息
WUser.get = function(openid, callback) {
  wuserModel.findOne({openid: openid}, function (err, wuser) {
    if (err) {
      return callback(err);
    }
    callback(null, wuser);
  });
};

//设置关注
WUser.setFav = function(openid,_id, callback) {
  wuserModel.update({openid: openid},{
    $push: {"fav": _id}
  },function (err, wuser) {
    if (err) {
      return callback(err);
    }
    if (wuser) {
      callback(null, wuser);//返回查询的一篇文章
    }
  });
};
