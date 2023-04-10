const admin = require('firebase-admin');
const prepend = require('prepend');
const nodemailer = require('nodemailer');

const auth = admin.auth();

const transporter = nodemailer.createTransport({
	service: process.env['nodemailer_service'],
	auth: {
		user: process.env['nodemailer_username'],
		pass: process.env['nodemailer_password']
	}
});

exports.logoutget = (req, res) => {
	const path = require('path');
	res.sendFile(path.join(__dirname, '..', 'templates', 'account/logout.html'));
}

exports.logoutpost = (req, res) => {
	function logout() {
		firebase.auth().signOut()
			.then(() => {
				console.log("User signed out successfully");
			})
			.catch((error) => {
				prepend('errors/logout.txt', err, function(error) {
					if (error)
						console.error(error);
				});
				console.log("Error signing out:", error);
			});
	}
	logout()
}