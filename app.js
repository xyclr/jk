
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
app.set('port', process.env.PORT || 3000);
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

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});




app.use('/users', users);
app.use('/weixin', weixin);
app.use(express.query()); // Or app.use(express.query());
app.use('/wechat', wechat('hchismylove', function (req, res, next) {
  // 微信输入信息都在req.weixin上
  var message = req.weixin;
  console.log(message);
  if((message.MsgType == 'event') && (message.Event == 'subscribe'))
  {
    var refillStr = "<a href=\"http://your_IP/weixin/refill?weixinId=" + message.FromUserName + "\">1. 点击记录团队充值</a>"

    var consumeStr = "<a href=\"http://your_IP/weixin/consume?weixinId=" + message.FromUserName + "\">2. 点击记录团队消费</a>"
    var deleteStr = "<a href=\"http://your_IP/weixin/delete?weixinId=" + message.FromUserName + "\">3. 点击回退记录</a>"
    var historyStr = "<a href=\"http://your_IP/weixin/history?weixinId=" + message.FromUserName + "\">4. 点击查询历史记录</a>"

    var emptyStr = "          ";
    var replyStr = "感谢你的关注！" + "\n"+ emptyStr + "\n" + refillStr + "\n"+ emptyStr + "\n" + consumeStr
        + "\n"+ emptyStr + "\n" + deleteStr + "\n"+ emptyStr + "\n" + historyStr;
    res.reply(replyStr);
  }
}));