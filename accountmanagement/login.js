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

exports.loginget = (req, res) => {
	const path = require('path');
	res.sendFile(path.join(__dirname, '..', 'templates', 'account/login.html'));
}

exports.loginpost = (req, res) => {
	const inputusernameoremail = req.body.usernameoremail;
	const inputpassword = req.body.password;

	const usernameoremail = sanitizeHtml(inputusernameoremail, {
		allowedTags: [],
		allowedAttributes: {}
	});

	const password = sanitizeHtml(inputpassword, {
		allowedTags: [],
		allowedAttributes: {}
	});

	if (!validator.isAlphanumeric(password)) {
		return res.status(400).send('Invalid password format');
	}

	function login(usernameOrEmail, password) {
		// Determine whether the input is a username or email
		let signInPromise;
		if (usernameOrEmail.includes('@')) {
			if (!validator.isEmail(usernameOrEmail)) {
				return res.status(400).send('Invalid password format');
			}
			signInPromise = auth.signInWithEmailAndPassword(usernameOrEmail, password);
		} else {
			if (!validator.isAlphanumeric(usernameOrEmail)) {
				return res.status(400).send('Invalid usernname format');
			}
			signInPromise = auth.signInWithUsernameAndPassword(usernameOrEmail, password);
		}

		// Sign in the user with the appropriate method
		return signInPromise
			.then((userCredential) => {
				console.log(`Logged in user ${userCredential.user.uid}`);
                export const accountdetails = userCredential.user
				return userCredential.user;
			})
			.catch((error) => {
				prepend('errors/login.txt', err, function(error) {
					if (error)
						console.error(error);
				});
				throw error;
			});
	}
//continuse

	login(usernameoremail, password)
		.then(() => {
			console.log("logged in successfully")
		})
		.catch(err => {
			console.error('Error logging in:' + err);
			prepend('login/login.txt', err, function(error) {
				if (error)
					console.error(error);
			});
			res.status(500).send('Error logging in:'+err);
		});
}