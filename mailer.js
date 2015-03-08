var pg = require('pg');
 
// Connects to postgres once, on server start
var connectionString = process.env.DATABASE_URL || "postgres://localhost/mailinglist";
 
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('_BArrEkgdN35APiBHkFK4A');
 
 
pg.connect(connectionString, function(err, client) {
  if (err) {
    console.log(err);
  } else {
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
    db.query("SELECT email FROM users WHERE last_email_sent IS NULL;", function(err, result) {
        if (err) {
        } else {
            firstEmail(result.rows);
        }
      })
    // Assemble a new email
 
    // Send the email to new users using mandrill
}

function sendUsersSecondMessage (db) {
    // Query for new users
    db.query("SELECT email FROM users WHERE last_email_sent BETWEEN NOW() AND  NOW() - INTERVAL '1 day';", function(err, result) {
        if (err) {
        } else {
            firstEmail(result.rows);
        }
      })
}

function sendUsersThirdMessage (db) {
    // Query for new users
    db.query("SELECT email FROM users WHERE last_email_sent BETWEEN NOW() AND  NOW() - INTERVAL '7 days';", function(err, result) {
        if (err) {
        } else {
            firstEmail(result.rows);
        }
      })
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
 
function sendEmail(message){
    mandrill_client.messages.send({"message": message, "async": true }, function(result) {
        console.log(result);
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
    });
}