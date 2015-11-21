var express = require('express'),
    fs = require('fs'),
    cheerio = require('cheerio'),
    request = require('request'),
    _ = require('lodash');

exports.extractData = function(options, callback){
    if(options.url!=undefined && options.selector!=undefined
        && options.exclude!=undefined && options.images!=undefined) {

        request({
            uri: options.url
        }, function(error, response, body){
            if(error==null && body!=undefined) {
                var $ = cheerio.load(body);

                var html = $(options.selector).remove(options.exclude).html();
                var images = [];

                _.forEach($(options.images).remove(options.exclude), function(imgNode){
                    images.push({
                        alt: $(imgNode).attr('alt'),
                        src: $(imgNode).attr('src')
                    });
                });

                callback({html: html, images: images});
            } else {
                logger.log('info', 'Error extracting data from webpage: %s', options.url);
                callback({html:'', images:[]});
            }
        });

    } else {
        callback({html:'', images:[]});
    }
}