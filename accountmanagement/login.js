const validator = require('validator');
const firebase = require("firebase/app");
const admin = require('firebase-admin');
const prepend = require('prepend');
const sanitizeHtml = require('sanitize-html');

const auth = admin.auth();

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
    signInPromise = auth.signInWithCredential(firebase.auth.EmailAuthProvider.credential(usernameOrEmail, password));
  } else {
    signInPromise = auth.signInWithCredential(firebase.auth.UsernameAuthProvider.credential(usernameOrEmail, password));
  }

  return signInPromise
    .then((userCredential) => {
      console.log(`Logged in user ${userCredential.user.uid}`);
      return userCredential.user;
    })
    .catch((error) => {
      console.error('Error logging in:', error);
      throw error;
    });
}


	login(usernameoremail, password)
		.then((user) => {
			console.log("logged in successfully")
		})
		.catch(err => {
			console.error('Error logging in:' + err);
			prepend('login/login.txt', err, function(error) {
				if (error)
					console.error(error);
			});
			res.status(500).send('Error logging in:' + err);
		});
}