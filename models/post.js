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

//��ȡһƪ����
Post.getOne = function(_id, callback) {
    postModel.findOne({"_id": new ObjectID(_id)}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (doc) {
            //ÿ���� 1 �Σ�pv ֵ���� 1
            postModel.update({"_id": new ObjectID(_id)}, {
                $inc: {"extra.pv": 1}
            }, {
                upsert: true
            }, function (err, doc) {
                console.info(err)
            });

            callback(null, doc);//���ز�ѯ��һƪ����
        }
    });

};

//�����������´浵��Ϣ
Post.getArchive = function (callback) {
    postModel.find({},{
        "name": 1,
        "time": 1,
        "title": 1,
        "thumb" : 1,
        "caseinfo" : 1,
        "post" : 1
    }, {},function (err, docs) {
        if (err) {
            return callback(err);
        }
        callback(null, docs);
    });
};
