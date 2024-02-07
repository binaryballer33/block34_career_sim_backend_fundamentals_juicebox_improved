const jwt = require("jsonwebtoken");

// Deny access if user is not logged in
async function protectedRoute(req, res, next) {
	const token = req.headers.authorization.split(" ")[1];

	if (!token)
		return res.status(401).send("You must be logged in to do that.");

	try {
		req.user = jwt.verify(token, "secretOrPrivateKey");
		next();
	} catch (error) {
		res.status(401).send("Invalid token");
	}
}

module.exports = { protectedRoute };
