const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const validator = require('validator');
const prepend = require('prepend');
const sanitizeHtml = require('sanitize-html');

const auth = admin.auth();

const transporter = nodemailer.createTransport({
	service: process.env['nodemailer_service'],
	auth: {
		user: process.env['nodemailer_username'],
		pass: process.env['nodemailer_password']
	}
});

exports.recoverget = (req, res) => {
	const path = require('path');
	res.sendFile(path.join(__dirname, '..', 'templates', 'account/recover.html'));
}

exports.recoverpost = (req, res) => {
	const inputemail = req.body.email;

	const email = sanitizeHtml(inputemail, {
		allowedTags: [],
		allowedAttributes: {}
	});

	if (!validator.isEmail(email)) {
		return res.status(400).send('Invalid email format');
	}

	function sendPasswordResetEmail(email) {
		return auth.generatePasswordResetLink(email)
			.then(link => {
				const mailOptions = {
					from: 'noreply.moonstone.system@gmail.com',
					to: email,
					subject: 'Password reset for your Firebase app',
					text: `Click this link to reset your password: ${link}`
				};

				return transporter.sendMail(mailOptions, (err) => {
					if (err) {
						console.log(err)
						prepend('errors/recover.txt', err, function(error) {
							if (error)
								console.error(error);
						});
					}
				})
			})
	}

	sendPasswordResetEmail(email)
		.then(() => {
			res.send('Email sent successfully');
		})
		.catch(err => {
			console.error('Error sending email:' + err);
			prepend('errors/recover.txt', err, function(error) {
				if (error)
					console.error(error);
			});
			res.status(500).send('Error loging error');
		});
}