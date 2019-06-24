var config = require('config');
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

var mailer = nodemailer.createTransport(sgTransport(config.get('sendgrid')));

var mail = {
    send: function (req, res, template, data) {
        res.render(template, data, function(err, html) {
            var email = {
                from: '"Hello World" <no-reply@helloworld-studio.com>',
                to: data.email,
                subject: 'Hello World : Password',
                html: html
            };

            mailer.sendMail(email, function(err, info){
                if (err ){
                    console.log(err);
                }
            });
        });
    }
};

module.exports = mail;
