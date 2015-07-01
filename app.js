/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/*app.get('/', routes.index);
app.get('/users', user.list);*/

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});



var wechat = require('wechat');
var config = {
  token: 'a23mnE1mgJvN2E7PEMgJg4Z37JZL4Eww',
  appid: 'wxc5709f2ac2454001',
  encodingAESKey: 'iTCKlJ8OPreLf8V791A7VLrDXcng6EUvFni6JAc53f9'
};


var OAuth = require('wechat-oauth');
var client = new OAuth('wxc5709f2ac2454001', 'c6d27018801ac6e11698825a77dabe4d');

app.use(express.query());

// 主页,主要是负责OAuth认真
app.get('/', function(req, res) {
  var url = client.getAuthorizeURL('http://' + 'www.sd188.cn'+'/user','snsapi_userinfo');
  console.info("url: " + url);
  res.redirect(url)
})

app.get('/user', function(req, res) {
   var code = req.query.code;
   console.info(code);
  client.getAccessToken(code, function (err, result) {
   
    var accessToken = result.data.access_token;
    var openid = result.data.openid;
    console.info("accessToken:" + accessToken);
    console.info("openid:" + openid);
    str += accessToken + "|" + openid;
     client.getUser(openid, function (err, result) {
        console.log('use weixin api get user: '+ err)
        console.info(result);
        var oauth_user = result;
    });
    
    
    client.getUserByCode(code, function (err, result) {
      console.info(result);
    });
  });
  
 
  res.end("success");
})

/**
 * 认证授权后回调函数
 *
 * 根据openid判断是否用户已经存在
 * - 如果是新用户，注册并绑定，然后跳转到手机号验证界面
 * - 如果是老用户，跳转到主页
 */
app.get('/callback', function(req, res) {
  console.log('----weixin callback -----')
  var code = req.query.code;
  console.info("code: " + code);
  console.info( req);console.info( req.model);
  var User = req.model.UserModel;

  client.getAccessToken(code, function (err, result) {
    console.dir(err)
    console.dir(result)
    var accessToken = result.data.access_token;
    var openid = result.data.openid;

    console.log('token=' + accessToken);
    console.log('openid=' + openid);

    User.find_by_openid(openid, function(err, user){
      console.log('微信回调后，User.find_by_openid(openid) 返回的user = ' + user)
      if(err || user == null){
        console.log('user is not exist.')
        client.getUser(openid, function (err, result) {
          console.log('use weixin api get user: '+ err)
          console.log(result)
          var oauth_user = result;

          var _user = new User(oauth_user);
          _user.username = oauth_user.nickname;
          _user.nickname = oauth_user.nickname;

          _user.save(function(err, user) {
            if (err) {
              console.log('User save error ....' + err);
            } else {
              console.log('User save sucess ....' + err);
              req.session.current_user = void 0;
              res.redirect('/user/' + user._id + '/verify');
            }
          });

        });
      }else{
        console.log('根据openid查询，用户已经存在')
        // if phone_number exist,go home page
        if(user.is_valid == true){
          req.session.current_user = user;
          res.redirect('/mobile')
        }else{
          //if phone_number exist,go to user detail page to fill it
          req.session.current_user = void 0;
          res.redirect('/users/' + user._id + '/verify');
        }
      }
    });
  });
});


app.use('/wechat', wechat(config, function (req, res, next) {
  // 微信输入信息都在req.weixin上
  var message = req.weixin;
  console.info(message);
  if (message.FromUserName === 'diaosi') {
    // 回复屌丝(普通回复)
    res.reply('hehe');
  } else if (message.FromUserName === 'text') {
    //你也可以这样回复text类型的信息
    res.reply({
      content: 'text object',
      type: 'text'
    });
  } else if (message.FromUserName === 'hehe') {
    // 回复一段音乐
    res.reply({
      type: "music",
      content: {
        title: "来段音乐吧",
        description: "一无所有",
        musicUrl: "http://mp3.com/xx.mp3",
        hqMusicUrl: "http://mp3.com/xx.mp3",
        thumbMediaId: "thisThumbMediaId"
      }
    });
  } else {
    // 回复高富帅(图文回复)
    res.reply([
      {
        title: '你来我家接我吧',
        description: '这是女神与高富帅之间的对话',
        picurl: 'http://nodeapi.cloudfoundry.com/qrcode.jpg',
        url: 'http://nodeapi.cloudfoundry.com/'
      }
    ]);
  };



}));
