var mongoose = require('./db');
var ObjectID = require('mongodb').ObjectID;



var userSchema = new mongoose.Schema({
    name: String,
    title: String,
    tags: String,
    post: String,
    time: {},
    comment : Array,
    thumb : String,
    caseinfo : Array,
    extra :{}
}, {
    collection: 'posts'
});

var postModel = mongoose.model('Post', userSchema);

function Post(title,tags, post,thumb,caseinfo) {
    this.title = title;
    this.tags = tags;
    this.post = post;
    this.thumb = thumb;
    this.caseinfo = caseinfo;
}

module.exports = Post;

//获取一篇文章
Post.getOne = function(_id, callback) {
    postModel.findOne({"_id": new ObjectID(_id)}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (doc) {
            //每访问 1 次，pv 值增加 1
            postModel.update({"_id": new ObjectID(_id)}, {
                $inc: {"extra.pv": 1}
            }, {
                upsert: true
            }, function (err, doc) {
                console.info(err)
            });

            callback(null, doc);//返回查询的一篇文章
        }
    });

};

//返回所有文章存档信息
Post.getArchive = function (callback) {
    postModel.find({},{
        "name": 1,
        "time": 1,
        "title": 1,
        "thumb" : 1,
        "post" : 1
    }, {},function (err, docs) {
        if (err) {
            return callback(err);
        }
        callback(null, docs);
    });
};

Post.favArchive = function (fav,callback) {
    postModel.find({"_id":{"$in":fav}},{
        "name": 1,
        "time": 1,
        "title": 1,
        "thumb" : 1,
        "post" : 1
    }, {},function (err, docs) {
        console.info(docs);
        if (err) {
            return callback(err);
        }

        callback(null, docs);
    });
};

Post.getBanner = function (callback) {
    postModel.find({ 'posi': "1" },{
        "name": 1,
        "time": 1,
        "title": 1,
        "thumb" : 1,
        "post" : 1
    }, {},function (err, docs) {
        if (err) {
            return callback(err);
        }
        callback(null, docs);
    });
};
