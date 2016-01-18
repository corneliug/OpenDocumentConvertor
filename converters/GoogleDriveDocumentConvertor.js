var fs = require('fs');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

exports.getDocument = function(authCode, fileId, callback){
    var $this = this;

    $this.authorize(authCode, function(oauth2Client){
       $this.convertGDriveDocument(oauth2Client, fileId, function(html){
           if(html!=null) {
               callback({status: 200, message: html});
           } else {
               callback({status: 500, message: 'err'});
           }
       });
    });
}

exports.authorize = function(authcode, callback) {
    var clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    var clientId = process.env.GOOGLE_CLIENT_ID;
    var redirectUrl = process.env.GOOGLE_REDIRECT_URI;
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    this.getToken(authcode, oauth2Client, callback);
}

exports.getToken = function(authcode, oauth2Client, callback) {
    oauth2Client.getToken(authcode, function(err, token) {
        if (err) {
            console.log('Error while trying to retrieve access token', err);
            return;
        }
        oauth2Client.credentials = token;
        callback(oauth2Client);
    });
}

exports.convertGDriveDocument = function(auth, fileId, callback) {
    var service = google.drive('v3');
    service.files.export({
        auth: auth,
        fileId: fileId,
        mimeType: 'text/html'
    }, function(err, response) {
        if (err) {
            console.log('error: ' + err);
            callback(null);
        }

        callback(response);
    });
}