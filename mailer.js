var mailer = {};
var pg = require('pg');

// Connects to postgres once, on server start
var connectionString = process.env.DATABASE_URL || "postgres://localhost/mailinglist";
 
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('_BArrEkgdN35APiBHkFK4A');
 
 
pg.connect(connectionString, function(err, client) {
  if (err) {
    console.log(err);
  } else {
    db = client;
    mailer.db = db;
    sendQueuedMail(client)
  }
});
 
function sendQueuedMail(db){
    sendNewUsersInitialMessage(db);
    sendUsersSecondMessage(db);
    sendUsersThirdMessage(db);
    // other mails
}
 
function sendNewUsersInitialMessage (db) {
    // Query for new users
     

    mailer.db.query("SELECT email FROM users WHERE last_email_sent IS NULL;", function(err, result) {
        if (err) {
        } else {
            firstEmail(result.rows);
        }
      })

    mailer.db.query("UPDATE users SET last_email_sent=NOW(), sequence='first' WHERE last_email_sent IS NULL;")


    // Assemble a new email
 
    // Send the email to new users using mandrill
}

function sendUsersSecondMessage (db) {
    // Query for new users
    mailer.db.query("SELECT email FROM users WHERE AND sequence='first', last_email_sent <= now() - interval '1 minute' ;", function(err, result) {
        if (err) {
        } else {
            secondEmail(result.rows);
        }
      })

     mailer.db.query("UPDATE users SET last_email_sent=NOW(), sequence='second' WHERE last_email_sent <= now() - interval '1 minute' AND sequence='first';")
}

function sendUsersThirdMessage (db) {
    // Query for new users
    mailer.db.query("SELECT email FROM users WHERE last_email_sent <= now() - interval '5 minute' AND sequence='second';", function(err, result) {
        if (err) {
        } else {
            thirdEmail(result.rows);
        }
      })

    mailer.db.query("UPDATE users SET last_email_sent=NOW(), sequence='third' WHERE last_email_sent <= now() - interval '5 minute' AND sequence='second';")
}
 
function firstEmail (users) {
    var message = {
    "text": "First email",
    "subject": "first email",
    "from_email": "troy@tradecrafted.com",
    "from_name": "not an example1",
    "to": users
    }
    sendEmail(message);
}

function secondEmail (users) {
    var message = {
    "text": "Second Email",
    "subject": "Second Email",
    "from_email": "troy@tradecrafted.com",
    "from_name": "not an example2",
    "to": users
    }
    sendEmail(message);
}

function thirdEmail (users) {
    var message = {
    "text": "Third Email",
    "subject": "Third Email",
    "from_email": "Third@tradecrafted.com",
    "from_name": "Third",
    "to": users
    }
    sendEmail(message);
}
 
function sendEmail(message){
    mandrill_client.messages.send({"message": message, "async": true }, function(result) {
        console.log(result);
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
    });
}

module.exports = mailer;