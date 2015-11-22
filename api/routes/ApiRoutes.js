var express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    multer  = require('multer'),
    WebpageConvertor = require('../../converters/WebpageConvertor'),
    CloudConvertor = require('../../converters/CloudConvertor');

router.route('/convert/file')
    .post(multer({ dest: './uploads/'}).single('file'), function(req, res){
        CloudConvertor.convert(req.file, function(response){
            res.status(200).send(response);
        });
    });

router.route('/convert/webpage')
    .post(function(req, res){

        WebpageConvertor.extractData(req.body, function(response){
            if(response.status == 200) {
                res.status(200).json({html: response.message, images: response.images});
            } else {
                res.status(response.status).json({message: response.message});
            }

        });
    });

module.exports = router;