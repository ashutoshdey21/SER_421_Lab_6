
const INVALID_ARGUMENT = "InvalidArgument";
const NEWS_STORY_NOT_FOUND = "NewsStoryNotFound";
const VALID_PARAMS = ['content', 'title', 'startDate', 'endDate', 'author'];


var express = require('express');
var router = express.Router();
let news_service = require('../newsModel/NewsService.js');
let newsServiceObj = new news_service();
const createError = require("http-errors");

function isValidKeys(query) {
    for( let value of query){
        if(!VALID_PARAMS.includes(value)){
            return false;
        }
    }
    return true;
}
router.post('/stories', function (req, res, next) {

    console.log("request body for /create: ", req.body);
    try {
        var result = newsServiceObj.addStory(req.body.title, req.body.content, req.body.author, req.body.isPublic, req.body.date)
        res.status(201);
        console.log("Story Created with ID:", result);
        res.setHeader('Location', 'http://'+ req.headers.host + '/stories/id/'+ result);
        res.send(JSON.stringify("Story Created with ID: "+ result));
    } catch (e) {
        console.log(e);
        if(e.toString().includes(INVALID_ARGUMENT)){
            next(createError(400));
        }
        else {
            next(createError(500));
        }
    }

});
router.get('/stories', function (req, res, next) {

    console.log("request body: ", req.query);
    if(!isValidKeys(Object.keys(req.query))){
        next(createError(400));
        return ;
    }
    console.log("should not be here")
    try {
        let filter = {};
        if(req.query.author){
            filter.author = req.query.author;
        }
        if(req.query.title){
            filter.title = req.query.title;
        }
        if(req.query.startDate && req.query.endDate){
            filter.dateRange = {startDate: req.query.startDate, endDate: req.query.endDate};
        }
        let result = newsServiceObj.getStoriesForFilter(filter);
        console.log(result);
        res.status(200);
        res.send(result);
    } catch (e) {
        console.log(e);
        if(e.toString().includes(INVALID_ARGUMENT)){
            next(createError(400));
        }
        else {
            next(createError(500));
        }
    }

});
router.get('/stories/:id', function (req, res, next) {

    try {
        let filter = {id: req.params.id};
        var result = newsServiceObj.getStoriesForFilter(filter);

            let send_data = result[req.params.id];
            if(send_data) {
                send_data.id = req.params.id;
                console.log(result);
                res.status(200);
                res.send(send_data);
            }else {
                next(createError(404));
            }
    } catch (e) {
        console.log(e);
        if(e.toString().includes(INVALID_ARGUMENT)){
            next(createError(400));
        }
        else {
            next(createError(500));
        }
    }

});
router.delete('/stories/:id', function (req, res, next) {

    console.log("request param - id: ", req.params.id);

    try {
        var result = newsServiceObj.deleteStory(req.params.id)
        res.status(204);
        res.send(result);
    } catch (e) {
        console.log(e);
        if(e.toString().includes(INVALID_ARGUMENT)){
            next(createError(400));
        }
        if(e.toString().includes(NEWS_STORY_NOT_FOUND)){
            next(createError(404));
        }
        else {
            next(createError(500));
        }
    }

});
router.patch('/stories', function (req, res, next) {
    console.log("request body: ", req.body);
    try {
        if(req.body.title) {
            var result = newsServiceObj.updateTitle(req.body.id, req.body.title)
        }
        else if(req.body.content){
            var result = newsServiceObj.updateContent(req.body.id, req.body.content)

        }
        res.status(204);
        res.send();
    } catch (e) {
        console.log(e);
        if(e.toString().includes(NEWS_STORY_NOT_FOUND)){
            next(createError(404));
        }
        else {
            next(createError(500));
        }
    }
});
router.all('/stories', function (req, res, next) {

    next(createError(405));

});

/*

router.post('/login', function (req, res, next) {

    if (req.body.username === req.body.password){
        req.session.secret = crypto.createHash('md5').update(req.body.password + new Date().toString().trim()).digest('hex');
        req.session.username = req.body.username;
        req.session.userrole = req.body.userrole;
        if(login_tokens[req.body.username] === undefined){
            login_tokens[req.body.username] = []
        }
        login_tokens[req.body.username].push(req.session.secret)

        console.log(req.session);
        res.redirect("/viewNews");
    }else {
        // res.redirect('/error');
        next(createError(401));
        // res.status(401);
        // res.send();

    }

});
router.all('/login', function (req, res, next) {

    next(createError(405));

});


router.post('/logout', function (req, res, next) {


    if(!isValidUser(req.session.username, req.session.secret)){
        // res.redirect('/landing');
        // res.status(401);
        // res.send();
        // return ;
        next(createError(401));
    }
    console.log(login_tokens)
    if(login_tokens[req.session.username]){
        const index = login_tokens[req.session.username].indexOf(req.session.secret);
        if (index > -1) {
            console.log(login_tokens[req.session.username]);
            login_tokens[req.session.username].splice(index, 1);
        }
    }
    req.session.destroy();
    res.status(201);
    res.send({link:"/landing"});
});
router.all('/logout', function (req, res, next) {

    next(createError(405));

});




router.get('/error', function (req, res, next) {

    let errorPage = '<!DOCTYPE html>\n' +
        '<html lang="en">\n' +
        '<head>\n' +
        '    <meta charset="UTF-8">\n' +
        '    <title>Error Page</title>\n' +
        '</head>\n' +
        '<body>\n' +
        '<header>\n' +
        '    <h1> Invalid Login credentials. </h1>\n' +
        '</header>\n' +
        '<p><a href=\'/landing\'>Login Again</a></p>\n' +
        '</body>\n' +
        '</html>';

    res.send(errorPage);
});
router.all('/error', function (req, res, next) {

    next(createError(405));

});


router.get('/viewNews', function (req, res, next) {

    if(isValidUser(req.session.username, req.session.secret))
    {
        fs.readFile(VIEW_NEWS_HTML, 'utf8',
            function(err, data) {
                if (err) {
                    console.log(err);
                }
                data = data.replace('$username1', req.session.username);
                // data = data.replace('$username2', req.session.username);
                data = data.replace('$userrole', req.session.userrole);
                res.send(data);
            });
    }
    else {
        // res.redirect('/landing');
        // res.status(401);
        // res.send();
        // return ;
        next(createError(401));

    }
});
router.all('/viewNews', function (req, res, next) {

    next(createError(405));

});


router.get('/createStoryForm', function (req, res, next) {
    if(isValidUser(req.session.username, req.session.secret))
    {
        fs.readFile(NEW_STORY_FORM_HTML, 'utf8',
            function(err, data) {
                if (err) {
                    console.log(err);
                }
                // data = data.replace('$username1', req.session.username);
                data = data.replace('$username2', req.session.username);
                // data = data.replace('$userrole', req.session.userrole);
                res.send(data);
            });
    }
    else {
        // res.redirect('/landing');
        // res.status(401);
        // res.send();
        // return ;
        next(createError(401));

    }
});
router.all('/createStoryForm', function (req, res, next) {

    next(createError(405));

});

router.get('/', function (req, res, next) {
    res.redirect("./landing.html");
});


router.get('/landing', function (req, res, next) {
    res.redirect("./landing.html");
});
router.all('/landing', function (req, res, next) {

    next(createError(405));

});


router.get('/viewableStories', function (req, res, next) {

    if(!isValidUser(req.session.username, req.session.secret)){
        // res.redirect('/landing');
        // res.status(401);
        // res.send();
        // return ;
        next(createError(401));

    }
    let all_stories = newsServiceObj.getStoriesForFilter({});
    let view_all_stories = filter_all_stories(all_stories, req.session.userrole, req.session.username );
    console.log(view_all_stories);
    res.send(JSON.stringify(view_all_stories));

});
router.all('/viewableStories', function (req, res, next) {

    next(createError(405));

});


function isValidUser(username, token) {
    if(login_tokens[username] && login_tokens[username].includes(token)){
        return true;
    }
}


function filter_all_stories(all_stories, userrole, username){
    let result_list = {};
    console.log(typeof (all_stories));
    let keys = Object.keys(all_stories)
    console.log(keys);
    for (let i in keys) {
        let key = keys[i];
        let article = all_stories[key];
        if (userrole === "author") {

            if (article.isPublic || article.author === username) {
                article.can_view = true;
            } else {
                article.can_view = false;
            }
            result_list[key]={ title: article.title, can_view: article.can_view};

        }else if (userrole === "guest") {

            if (article.isPublic) {
                article.can_view = true;
            } else {
                article.can_view = false;
            }
            console.log("last: " + article.can_view + ", "+article.isPublic)
            result_list[key]={ title: article.title, can_view: article.can_view};

        } else {
            article.can_view = true;
            result_list[key]={ title: article.title, can_view: article.can_view};

        }

    }

    console.log("filterViewableStories: " + result_list);
    return result_list;
}
*/


module.exports = router;
