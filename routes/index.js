var wechat = require('wechat');
var config = {
    token: 'a23mnE1mgJvN2E7PEMgJg4Z37JZL4Eww',
    appid: 'wx0dc4996a4c1b3f2a',
    encodingAESKey: 'xEXUgN5t41h0rlGOAIdvcRYv6lnWb5OQycspp7CwWNk'
};


var OAuth = require('wechat-oauth');
var client = new OAuth('wx0dc4996a4c1b3f2a', '1c33d19116ae8668de781a9ac108ca87');



module.exports = function (app) {
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
        });
    
    
        res.end("success");
    })
}
