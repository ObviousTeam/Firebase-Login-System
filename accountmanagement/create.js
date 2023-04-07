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

exports.createget = (req, res) => {
	const path = require('path');
	res.sendFile(path.join(__dirname, '..', 'templates', 'account/create.html'));
}

exports.createpost = (req, res) => {
	const inputusername = req.body.username;
	const inputpassword = req.body.password;
	const inputemail = req.body.email;

	const username = sanitizeHtml(inputusername, {
		allowedTags: [],
		allowedAttributes: {}
	});

	const password = sanitizeHtml(inputpassword, {
		allowedTags: [],
		allowedAttributes: {}
	});

	const email = sanitizeHtml(inputemail, {
		allowedTags: [],
		allowedAttributes: {}
	});

  if (username.length >= 20 || username.length < 6) {
    return res.status(400).send('Username can not be longer then 15 letters or shorter then 6.');
  }

  if (password.length >= 20 || password.length < 6) {
    return res.status(400).send('Password can not be longer then 15 letters or shorter then 6.');
  }

	if (!validator.isAlphanumeric(username)) {
		return res.status(400).send('Invalid username format');
	}

	if (!validator.isAlphanumeric(password)) {
		return res.status(400).send('Invalid password format');
	}

	if (email != "" && !validator.isEmail(email)) {
		return res.status(400).send('Invalid email format');
	}

	function signUp(email, username, password) {
		return auth.createUser({
				email: email,
				username: username,
				password: password
			})
			.then(userRecord => {
				return auth.generateEmailVerificationLink(email);
			})
			.then(link => {
				const mailOptions = {
					from: 'noreply.moonstone.system@gmail.com',
					to: email,
					subject: 'Verify your email for your Moonstone account.',
					text: `Click this link to verify your email: ${link}`
				};
				return transporter.sendMail(mailOptions);
			})
			.catch(err => {
				res.status(500).send('Error creating new user: ' + err);
				prepend('errors/create.txt', err, function(error) {
					if (error)
						console.error(error);
				});
				throw err;
			});
	}

	signUp(email, username, password)
		.then(() => {
			res.send('Account created successfully');
		})
		.catch(err => {
			console.error('Error creating account:', err);
			prepend('errors/create.txt', err, function(error) {
				if (error)
					console.error(error);
			});
			res.status(500).send('Error creating account');
		});
}