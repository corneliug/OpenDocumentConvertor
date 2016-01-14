var express = require('express'),
    _ = require('lodash'),
    fs = require('fs'),
    request = require('request'),
    striptags = require('striptags'),
    striphtml = require('js-striphtml'),
    AdmZip = require('adm-zip'),
    url = require('url'),
    http = require('http'),
    formats = require(__dirname + '/../config/formats');

var fileType = require('file-type');

exports.convert = function(options, callback){
    var $this = this;

    if(options!=undefined && options.filename!=undefined && options.mimetype!=undefined){
        var filepath = __dirname + '/../uploads/' + options.filename;

        $this.initConvertJob({filename: options.filename, filepath: filepath, mimetype: options.mimetype}, function(initOpts){
            if(initOpts!=undefined){
                $this.uploadFile(initOpts, function(uploadOpts){
                    if(uploadOpts!=undefined){
                        $this.checkJobCompletedDownloadFile(uploadOpts, function(uri){
                            if(uri!=undefined) {
                                var options = {
                                    host: url.parse(uri).host,
                                    port: 80,
                                    path: url.parse(uri).pathname
                                };

                                var htmlPayload = "";
                                var isZip = false;

                                http.get(options, function(res) {
                                    var data = [], dataLen = 0;

                                    res.on('data', function(chunk) {

                                        data.push(chunk);
                                        dataLen += chunk.length;

                                    }).once('data', function(chunk) {
                                        var filetype = fileType(chunk);
                                        isZip = filetype!=null && filetype.mime!=null && filetype.mime=='application/zip';
                                    }).on('end', function(){
                                        if(isZip) {
                                            var buf = new Buffer(dataLen);

                                            for (var i=0, len = data.length, pos = 0; i < len; i++) {
                                                data[i].copy(buf, pos);
                                                pos += data[i].length;
                                            }

                                            var zip = new AdmZip(buf);
                                            var zipEntries = zip.getEntries();
                                            var htmlIndexes = [];

                                            for (var i = 0; i < zipEntries.length; i++){
                                                if(zipEntries[i].name.match(/.html$/)!=null) {
                                                    htmlIndexes.push(i);
                                                }

                                                if(zipEntries[i].name.match(/-\d+.html$/)!=null) {
                                                    htmlPayload += zip.readAsText(zipEntries[i], 'utf-8');
                                                }
                                            }

                                            if(htmlIndexes.length==1){
                                                htmlPayload += zip.readAsText(zipEntries[htmlIndexes[0]], 'utf-8');
                                            }

                                            $this.stripTags(htmlPayload, function(html){
                                                callback({status: 200, message: html});
                                            });
                                        } else {
                                            $this.doDownloadConvertedFile(uri, function(dnldResp){
                                                if(dnldResp!=undefined) {
                                                    $this.stripTags(dnldResp, function(html){
                                                        deleteFile(filepath);
                                                        callback({status: 200, message: html});
                                                    });
                                                } else {
                                                    $this.signalInternalError(callback);
                                                }
                                            });
                                        }
                                    });
                                });
                            } else {
                                $this.signalInternalError(callback);
                            }
                        });
                    } else {
                        $this.signalInternalError(callback);
                    }
                })
            } else {
                $this.signalInternalError(callback);
            }
        });

    } else {
        callback({status: 400, message:'The request is missing the file parameter!'});
    }
}

exports.initConvertJob = function(options, callback){
    request({
        method: 'POST',
        url: 'https://api2.online-convert.com/jobs',
        headers: {
            'Content-Type': 'application/json',
            'X-Oc-Api-Key': process.env.OCR_API_KEY
        },
        body: {
            "conversion": [{
                "target": "html"
            }]
        },
        json: true
    }, function(err, response, body){
        if(err || !body || !response) {
            callback(undefined);
        } else {
            callback(
                {
                    id: body.id,
                    token: body.token,
                    server: body.server,
                    filename: options.filename,
                    filepath: options.filepath,
                    mimetype: options.mimetype
                }
            );
        }
    });
}

exports.uploadFile = function(options, callback){
    var contentType = getContentType(options.mimetype);

    var formData = {
        file: {
            value:  fs.createReadStream(options.filepath),
            options: {
                filename: options.filename + '.' + contentType,
                contentType: contentType
            }
        },
        'content-type': contentType,
        'Content-Disposition': 'form-data',
        'name': 'file',
        'filename': options.filename
    };

    request({
        method: 'POST',
        url: options.server + '/upload-file/' + options.id,
        headers: {
            'X-Oc-Token': options.token
        },
        formData: formData
    }, function(err, response, body){
        if(err || !response || !body){
            callback(undefined);
        } else {
            callback({id: options.id, token: options.token});
        }
    });
}

exports.checkJobCompletedDownloadFile = function(options, callback){
    $this = this;

    request({
        method: 'GET',
        url: 'https://api2.online-convert.com/jobs/' + options.id,
        headers: {
            'X-Oc-Token': options.token
        }
    }, function(err, response, body){
        if(err || !response || !body) {
            callback(undefined);
        } else {
            body = JSON.parse(body);

            if(body.status.code!='completed'){
                logger.log('info', 'Job %s is not completed. Retrying in 2 seconds.', options.id);
                setTimeout(function(){
                    $this.checkJobCompletedDownloadFile(options, callback)
                }, 2000);
            } else {
                callback(body.output[0].uri);
            }
        }
    });
}

exports.doDownloadConvertedFile = function(uri, callback){
    request({
        method: 'GET',
        url: uri
    }, function(err, response, body){
        if(err || !response || !body){
            callback(undefined);
        } else {
            callback(body);
        }
    });
}

exports.stripTags = function(html, callback){
    var res = striptags(html, config.allowed_tags);
    res = striphtml.stripAttr(res, undefined);

    callback(res);
}

exports.signalInternalError = function(callback){
    callback({status: 500, message: 'Internal processing error!'});
}

var getContentType = function(mimetype){
    return _.result(_.find(formats, function(chr) {
        return chr.mimetype == mimetype;
    }), 'contentType');
}

var deleteFile = function(filepath){
    fs.unlink(filepath, function(){});
}
