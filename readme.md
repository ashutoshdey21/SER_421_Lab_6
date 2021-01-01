**Execution**:

In order to start the project please execute:
node SER_421_Lab_6/bin/www
Server Starts at 'http://localhost:3000/'


**Activity**:

routes/NewsAPI_REST.js

**API info**:
 
* POST '/stories'- creates a new article.
* GET '/stories/:id'- gets the story with the particular id
* PATCH '/stories': edits the title or content of an existing article(we need to know the id of the article).
* DELETE '/stories/:id'- deletes an existing article(we need to know the id of the article).
* GET '/stories'- returns a list of articles based on one or more of the following criteria: author, start date, end date, title text

Activity Postman collection file: NewsService_test.json
Import the NewsService_test.json file into Postman.

 

**Initialization**:

```
let news_service = require('../news_service/NewsService.js');
let newsServiceObj = new news_service();
```

* Cookies need to be enabled.
* Whenever the username is same as the password, it will be treated as a successful authentication.
* We have used the 'crypto' package in order to generate the token and set it up on the req.session.
* Hence in subsequent request we will be having the token.


Please take note of the following packages.
```
const createError = require("http-errors");
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

```
