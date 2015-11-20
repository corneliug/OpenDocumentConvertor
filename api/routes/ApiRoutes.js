var express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    multer  = require('multer');

router.route('/convert')
    .post(multer({ dest: './uploads/'}).single('file'), function(req, res){
        console.log(req.file); //form files

        res.status(200).json({html: "<h2>Title</h2><p>text</p>"});
    });

module.exports = router;