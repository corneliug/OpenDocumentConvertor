var fs = require('fs'),
    google = require('googleapis'),
    googleAuth = require('google-auth-library'),
    striptags = require('striptags'),
    striphtml = require('js-striphtml');

exports.getDocument = function(authCode, fileId, callback){
    var $this = this;

    $this.authorize(authCode, function(oauth2Client){
       $this.convertGDriveDocument(oauth2Client, fileId, function(html){
           if(html!=null) {
               $this.stripTags(html, function(formattedHtml){
                   callback({status: 200, message: formattedHtml});
               });
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

exports.stripTags = function(html, callback){
    var res = striptags(html, config.allowed_tags);
    res = striphtml.stripAttr(res, undefined);

    callback(res);
}