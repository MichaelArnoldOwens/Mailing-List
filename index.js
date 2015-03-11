var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var pg = require('pg');
var port = process.env['PORT'];
var db;
var conString = process.env['DATABASE_URL']
var ejs = require('ejs');

//logging middleware
app.use(function(req,res,next) {
    console.log('Request at ', req.path);
    next();
});
//logging end

app.set('view engine', 'ejs');

pg.connect(conString, function(err, client) {
    db = client;
})


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/static'));

//Respond to POST requests
app.post('/submit', function(request,response,next) {
    console.log(request.body);
    if(validateEmail(request.body.email)){
        db.query("INSERT INTO users (email, last_email_sent) VALUES ($1, $2)", [request.body.email, null], function(err, result) {
        if (err) {
          if (err.code == "23502") {
            err.explanation = "Didn't get all of the parameters in the request body. Send email in the request body."
          }
          response.status(500).send(err);
        } else {
            console.log(result);
            response.send("thanks: " + request.body.email);
        }
        });
    }
    else {
        response.send("You entered an invalid email");
    }
    // response.end('Thank you: ' + request.body.email);
});


//GET
app.get('/', function (request, response) {
// We get access here to the request, so we can find out more information about what the requester wants.
// We also get access to the response object, which is the object that allows us to send a string (or other things) back to the requester.

    response.send('<h1>Hello World!</h1>');
});

//get all messages in a type's channel
app.get('/users', function (req, res) {
  console.log(db);
  db.query("SELECT email, created FROM users", function(err, result) {
    if (err) {
      res.status(500).send(err);
    } else {

        res.render('table', { 'users' : result.rows } )

        // res.send(result.rows);
    }
  })
});
 
function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 

app.listen(port);