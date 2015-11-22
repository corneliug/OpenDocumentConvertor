var express = require('express'),
    _ = require('lodash'),
    fs = require('fs'),
    request = require('request'),
    formats = require(__dirname + '/../config/formats');

exports.convert = function(options, callback){
    if(options!=undefined && options.filename!=undefined && options.mimetype!=undefined){
        var filepath = __dirname + '/../uploads/' + options.filename;
        var contentType = getContentType(options.mimetype);

        var formData = {
            file: {
                value:  fs.createReadStream(filepath),
                options: {
                    filename: options.filename + '.' + contentType,
                    contentType: contentType
                }
            }
        };

        var uri = 'https://api.cloudconvert.com/convert?';
        uri += 'apikey=' + process.env.COULDCONVERT_API_KEY;
        uri += '&input=upload&inputformat=' + contentType;
        uri += '&outputformat=html';

        request.post({url:uri, formData: formData}, function(err, httpResponse, body) {
                if (err) {
                    callback({status: 501, message: 'Failed to upload file on CloudConvert: ' + err});
                }

                var convertedFileResponse = body.match(/Redirecting to (https:[\w\W\S]+)/);

                if(convertedFileResponse){
                    var responseUri = convertedFileResponse[1];

                    request.get({
                        url: responseUri
                    }, function(err, response, body){
                        deleteFile(filepath);
                        callback(body);
                    });
                } else {
                    callback({status: 502, message: body});
                }

            });
    } else {
        callback({status: 400, message:'The request is missing the file parameter!'});
    }
}

var getContentType = function(mimetype){
    return _.result(_.find(formats, function(chr) {
        return chr.mimetype == mimetype;
    }), 'contentType');
}

var deleteFile = function(filepath){
    fs.unlink(filepath, function(){});
}
