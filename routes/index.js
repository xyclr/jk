var settings = require('../settings');
var Post = require('../models/post.js');
var Comment = require('../models/comment.js');
var WUser = require('../models/wuser.js');




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
        client.getAccessToken(code, function (err, result) {
            var accessToken = result.data.access_token;
            var openid = result.data.openid;
            console.log('token=' + accessToken);
            console.log('openid=' + openid);
            WUser.get(openid,function(err, wuser){
                console.log('use weixin api get user: '+ err)
                console.info(wuser);
                if(err || wuser == null){
                    console.log('user is not exist.')
                    client.getUser(openid, function (err, result) {
                        console.log('use weixin api get user: '+ err)
                        console.log(result)

                        var _user = new WUser({
                            openid: result.openid,
                            nickname: result.nickname,
                            headimgurl: result.headimgurl,
                            city: result.city,
                            province: result.city,
                            country: result.country,
                            sex: result.sex
                        });

                        _user.save(function(err, wuser) {
                            if (err) {
                                console.log('User save error ....' + err);
                            } else {
                                console.log('User save sucess ....' + err);
                                req.session.wuser = wuser;
                                res.redirect('/case');
                            }
                        });

                    });
                } else {
                    console.info("user exist");
                    res.redirect('/case');
                }
            })

        });
    });

    app.post('/setFav/:_id', function(req, res) {
        var _id = req.params._id;
        console.info("openid:" + req.session.wuser.openid)
        WUser.setFav(req.session.wuser.openid,_id,function(err){
            if (err) {
                return res.redirect('back');
            }
            res.redirect('/p/' + _id);
        })
    });


    app.get('/case', function(req, res) {
        
        Post.getArchive(function (err, posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }

            Post.getBanner(function (err, banner) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                res.render('case', {
                    title: '存档',
                    posts: posts,
                    banner: banner
                });
            });

        });
    })

    app.get('/p/:_id', function(req, res){
        
        Post.getOne(req.params._id, function (err, post) {
            if (err) {
                return res.redirect('/');
            }
            res.render('casedetail', {
                title: post.title,
                post: post
            });
        });
    });

    app.get('/comment/:_id', function (req, res) {
        Post.getOne(req.params._id, function (err, post) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('comment', {
                title: post.title
            });
        });
    });

    app.post('/comment/:_id', function (req, res) {
        var _id = req.params._id;
        var newComment = new Comment(req.body.name,req.body.comment);
        newComment.save(_id,function (err) {
            if (err) {
                return res.redirect('back');
            }
            res.redirect('/p/' + _id);
        });
    });

    app.get('/my', function(req, res) {
        
        res.render('my', {
            title: '个人中心',
            wuser: req.session.wuser
        });
    })
}
