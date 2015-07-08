/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var request = require('request');

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
    appid: 'wx0dc4996a4c1b3f2a',
    encodingAESKey: 'xEXUgN5t41h0rlGOAIdvcRYv6lnWb5OQycspp7CwWNk'
};


var OAuth = require('wechat-oauth');
var client = new OAuth('wx0dc4996a4c1b3f2a', '1c33d19116ae8668de781a9ac108ca87');

app.use(express.query());

// 主页,主要是负责OAuth认真
app.get('/', function(req, res) {
    var url = client.getAuthorizeURL('http://www.sd188.cn/user','','snsapi_userinfo');
    console.info("AuthorizeURL: " + url);



    res.redirect(url)
})

app.get('/user', function(req, res) {





    function getToken(cb) {
        var tokenUrl = 'https:\/\/api.weixin.qq.com\/cgi-bin\/token?grant_type=client_credential&appId=' + 'wxc5709f2ac2454001' + '&secret=' + 'c6d27018801ac6e11698825a77dabe4d';
        request.get(tokenUrl, function(error, response, body) {
            if (error) {
                cb('getToken error', error);
            }
            else {
                try {
                    var token = JSON.parse(body).access_token;
                    cb(null, token);
                }
                catch (e) {
                    cb('getToken error', e);
                }
            }
        });
    }

    var code = req.query.code;
    console.info("code:" + code);
    client.getAccessToken(code, function (err, result) {
        console.dir(result);
        var accessToken = result.data.access_token;
        var openid = result.data.openid;
        console.info("accessToken:" + accessToken);
        console.info("openid:" + openid);

        client.getUser(openid, function (err, result) {
            console.log('use weixin api get user: '+ err)
            console.info(result);
            var oauth_user = result;
        });

        /*getToken(function(err,result){
            console.info(result);
            request.get('https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + result + '&openid=' + openid, function(error, response, body) {
                if (error) {
                    cb('getToken error', error);
                }
                else {
                    try {
                        console.info(body)
                    }
                    catch (e) {
                    }
                }
            });
        })*/
    });


    res.end("success");
})




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
