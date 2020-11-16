Activity 1:
routes/NewsServiceAPI.js

API info:
'/login': creates a new session for a user when supplied with the username, password and role and sets a secret token to the session.
 
Note: all the below endpoints would work as expected only if we have received a successful response after hitting the '/login' endpoint.
 
'/create': creates a new article.
'/editTitle': edits the title of an existing article(we need to know the id of the article).
'/editContent': edits the content of an existing article(we need to know the id of the article).
'/delete': deletes an existing article(we need to know the id of the article).
'/search': returns a list of articles based on one or more of the following criteria: author, start date, end date, title text
'/logout': invalidates the current session.
 
Activity 2:

initialization:
```
let news_service = require('../news_service/NewsService.js');
let newsServiceObj = new news_service();
```

Cookies need to be enabled
whenever the username is same as the password, it will be treated as a successful authentication.
We have used the 'crypto' package in order to generate the token and set it up on the req.session.
Hence in subsequent request we will be having the token.


They are required for Activity 2 in NewsServiceAPI.js and may be modified if the location is changed.
```
const VIEW_NEWS_HTML = './front_server/viewNews.html';
const NEW_STORY_FORM_HTML = './front_server/new_story_form.html';

```

Please take note of the following packages.
```
var crypto = require('crypto');
const createError = require("http-errors");
var fs = require('fs');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

```

API info:

'/getStoryByID': returns the story with a particular id.
'/error': sends sn error page to the server.
'/viewNews': renders the initial view news pages on the client.
'/createStoryForm': renders the form that will help create a new story.
'/': redirects to the landing page.
'/landing': redirects to the landing page.
'/viewableStories': returns the list of stories that need to be displayed after login.