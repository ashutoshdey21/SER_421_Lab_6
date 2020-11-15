const VIEW_NEWS_HTML = './front_server/viewNews.html';
const NEW_STORY_FORM_HTML = './front_server/new_story_form.html';

var express = require('express');
const createError = require("http-errors");
var router = express.Router();
let news_service = require('../news_service/NewsService.js');
let newsServiceObj = new news_service();
var crypto = require('crypto');
var login_tokens = new Map();
var fs = require('fs');

router.post('/create', function (req, res, next) {

    if(!isValidUser(req.session.username, req.session.secret)){
        next(createError(401));
        // res.status(401);
        // res.send();
        // return ;
        // res.redirect('/landing');
    }

    console.log("request body for /create: ", req.body);
    try {
        var result = newsServiceObj.addStory(req.body.title, req.body.content, req.body.author, req.body.isPublic, req.body.date)
        res.status(201);
        console.log("Story Created with ID:", result);
        res.send(JSON.stringify("Story Created with ID: "+ result));
    } catch (e) {
        console.log(e);
        next(createError(500));
    }

});


router.patch('/editTitle', function (req, res, next) {
    if(!isValidUser(req.session.username, req.session.secret)){
        // res.redirect('/landing');
        // res.status(401);
        // res.send();
        // return ;
        next(createError(401));

    }
    console.log("request body: ", req.body);
    try {
        var result = newsServiceObj.updateTitle(req.body.id, req.body.title)
        res.status(204);
        res.send();
    } catch (e) {
        console.log(e);
        next(createError(500));
    }
});


router.patch('/editContent', function (req, res, next) {


    if(!isValidUser(req.session.username, req.session.secret)){
        // res.redirect('/landing');
        next(createError(401));
        // res.status(401);
        // res.send();
        // return ;
    }
    console.log("request body: ", req.body);
    try {
        var result = newsServiceObj.updateContent(req.body.id, req.body.content)

        res.status(204);
        res.send();
    } catch (e) {
        console.log(e);
        next(createError(500));
    }
});


router.delete('/delete', function (req, res, next) {

    if(!isValidUser(req.session.username, req.session.secret)){
        next(createError(401));
        // res.redirect('/landing');
        // res.status(401);
        // res.send();
        // return ;
    }
    console.log("request body: ", req.body.id);

    try {
        var result = newsServiceObj.deleteStory(req.body.id)
        res.status(204);
        res.send(result);
    } catch (e) {
        console.log(e);
        next(createError(500));
    }

});


router.get('/search', function (req, res, next) {

    if(!isValidUser(req.session.username, req.session.secret)){
        next(createError(401));
        // res.redirect('/landing');
        // res.status(401);
        // res.send();
        // return ;
    }

    console.log("request body: ", req.query);
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
        var result = newsServiceObj.getStoriesForFilter(filter);
        console.log(result)
        res.status(200);
        res.send(result);
    } catch (e) {
        console.log(e);
        next(createError(500));
    }

});


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


router.get('/getStoryByID', function (req, res, next) {

    if(!isValidUser(req.session.username, req.session.secret)){
        // res.redirect('/landing');
        // res.status(401);
        // res.send();
        // return ;
        next(createError(401));

    }

    console.log("request body: ", req.query);
    try {
        var result = newsServiceObj.getStoriesForFilter({id: req.query.id});
        console.log(result[req.query.id])
        res.status(200)
        let send_data = result[req.query.id];
        send_data.id = req.query.id;
        res.send(send_data);
    } catch (e) {
        console.log(e);
        next(createError(500));
    }

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


router.get('/', function (req, res, next) {
    res.redirect("./landing.html");
});


router.get('/landing', function (req, res, next) {
    res.redirect("./landing.html");
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


module.exports = router;
