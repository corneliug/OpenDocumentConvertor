var express = require('express'),
    cors = require('cors'),
    reqLogger = require('morgan'),
    winston = require('winston'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    ApiRoutes = require(__dirname + '/api/routes/ApiRoutes');

global.config = require(__dirname + '/config/config.js');

require('dotenv').config({path: '.env'});

var app = express();

winston.level = config.logging_level;

global.logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: function() {
                var dt = new Date();
                var formatted = dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear() + " ";
                formatted += dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds() + ":" + dt.getMilliseconds();

                return formatted;
            },
            formatter: function(options) {
                // Return string will be passed to logger.
                return options.timestamp() +' '+ options.level.toUpperCase() +' '+ (undefined !== options.message ? options.message : '') +
                    (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
            }
        }),
        new (winston.transports.File)({ filename: 'app.log' })
    ]
});

app.use(cors({
    'methods': ['GET', 'POST']
}));

app.use(reqLogger('dev'));
app.use(session({ 
    secret: 'asd13asd786youtasvasdas3a78vwe123',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json({limit: '50mb'})); // for parsing application/json

app.listen(config.port);

app.use('/api/v1', ApiRoutes);


module.exports = app;
