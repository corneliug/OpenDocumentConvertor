var express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    multer  = require('multer'),
    WebpageConvertor = require('../../converters/WebpageConvertor');

router.route('/convert')
    .post(multer({ dest: './uploads/'}).single('file'), function(req, res){
        console.log(req.file); //form files

        res.status(200).json({html: "<h2>Title</h2><p>text</p>"});
    });

router.route('/convert/webpage')
    .post(function(req, res){

        WebpageConvertor.extractData(req.body, function(output){
            res.status(200).json(output);
        });
    });

module.exports = router;