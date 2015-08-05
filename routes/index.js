var settings = require('../settings');
var Post = require('../models/post.js');
var Comment = require('../models/comment.js');
var WUser = require('../models/wuser.js');
var Card = require('../models/card.js');
var url = require('url');
var querystring = require('querystring');





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


    app.get('/user', checkLogin);
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


    app.post('/setFav/:_id', checkLogin);
    app.post('/setFav/:_id', function(req, res) {
        var _id = req.params._id;
        var arg = url.parse(req.url).query;
        var type = querystring.parse(arg).action;
        if(req.session.wuser == undefined) return res.end("请先用微信打开页面");
        WUser.setFav(req.session.wuser.openid,_id,type,function(err){
            if (err) {
                return res.redirect('back');
            }
            res.end("success");
        })
       
    });

    app.get('/favlist', function(req, res) {

        WUser.get(req.session.wuser.openid,function(err, wuser){

            Post.favArchive(wuser.fav,function (err, posts) {
                if (err) {
                    return res.redirect('/');
                }
                res.render('favlist', {
                    title: '我的关注',
                    posts: posts
                });
            });
        });

    })


    app.get('/case', function(req, res) {

        WUser.get("sdfadfa1231231231",function(err, wuser){
            if(err || wuser == null){
                var _user = new WUser({
                    openid: "sdfadfa1231231231",
                    nickname: "苟建军杀敌发到付",
                    headimgurl: "http://www.ndesig.com/img/profile_small.jpg",
                    city: "Chengdu",
                    province: "Sichuan",
                    country: "China",
                    sex: 1
                });
                _user.save(function(err, wuser) {
                    if (err) {
                        console.log('User save error ....' + err);
                    } else {
                        console.log('User save sucess ....' + err);
                        req.session.wuser = wuser;
                    }
                });
            }
        })



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
    });

    app.get('/card', function (req, res) {
        Card.getArchive(function (err, posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('card', {
                title: '兑换',
                posts: posts
            });
        });
    });

    app.get('/card/:_id', function(req, res){
        Card.getOne(req.params._id, function (err, post) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('cardarticle', {
                title: post.title,
                post: post,
                user: req.session.user
            });
        });
    });

    app.get('/p/:_id', function(req, res){
        var _id = req.params._id;
        Post.getOne(_id, function (err, post) {
            if (err) {
                return res.redirect('/');
            }
            //未登录
            if(req.session.wuser === undefined) {
                return res.render('casedetail', {
                    isFav : false,
                    title: post.title,
                    post: post
                });
            }
            WUser.get(req.session.wuser.openid,function(err, wuser){
                var isFav = false;
                wuser.fav.forEach(function(i){
                    if(i === _id) isFav = true;
                });
                console.info("isFav:" + isFav);
                 res.render('casedetail', {
                    user : req.session.wuser,
                    isFav : isFav,
                    title: post.title,
                    post: post
                });
            });
           
        });
    });

    app.get('/comment/:_id', checkLogin);
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

    app.post('/comment/:_id', checkLogin);
    app.post('/comment/:_id', function (req, res) {
        var _id = req.params._id;
        var newComment = new Comment(req.session.wuser.nickname,req.body.comment,req.session.wuser.headimgurl);
        newComment.save(_id,function (err) {
            if (err) {
                return res.redirect('back');
            }
            res.redirect('/p/' + _id);
        });
    });

    app.get('/my', checkLogin);
    app.get('/my', function(req, res) {
        WUser.get(req.session.wuser.openid,function(err, wuser){
            res.render('my', {
                title: '个人中心',
                wuser : wuser
            });
        });
    });

    app.get('/logintip', function(req, res){
        res.render('logintip', {
            title: '请用微信登录'
        });
    });

    function checkLogin(req, res, next) {
        if (!req.session.wuser) {
            return res.redirect('/logintip');  //一定要return 不然报错 “Can't set headers after they are sent.”
        }
        next();
    }

    function checkNotLogin(req, res, next) {
        if (req.session.wuser) {
            return res.redirect('back');
        }
        next();
    }
}
