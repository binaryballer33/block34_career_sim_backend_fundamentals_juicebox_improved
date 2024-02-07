const authRouter = require("express").Router();
const { prisma, createUser, updateUser, deleteUser } = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// get all users
authRouter.get("/", async (req, res, next) => {
	try {
		const users = await prisma.user.findMany();
		res.send({ users });
	} catch (error) {
		next(error);
	}
});

// Register a new user account
authRouter.post("/register", async (req, res, next) => {
	const { name, username, password } = req.body;
	const hashedPassword = await bcrypt.hash(password, 10);
	const userToCreate = {
		name: name,
		username: username,
		password: hashedPassword,
	};

	try {
		const user = await createUser(userToCreate);
		const token = jwt.sign({ id: user.id }, "secretOrPrivateKey"); // Create token with user id

		res.status(201).send({ token });
	} catch (error) {
		next(error);
	}
});

// Login to an existing user account
authRouter.post("/login", async (req, res, next) => {
	const { username, password } = req.body;

	try {
		if (!username || !password)
			return res
				.status(400)
				.send("Please supply both a username and password");

		const user = await prisma.user.findUnique({
			where: { username: username },
		});

		console.log("user: ", user);

		if (!user) return res.status(401).send("Invalid login credentials.");

		const isCorrectPassword = await bcrypt.compare(password, user.password);
		console.log("isCorrectPassword: ", isCorrectPassword);

		if (!isCorrectPassword)
			return res.status(401).send("Username or password is incorrect");

		// Create a token with the user id
		const token = jwt.sign({ id: user.id }, "secretOrPrivateKey");
		res.status(201).send({ token });
	} catch (error) {
		next(error);
	}
});

// Update an existing user account
authRouter.put("/updateUser/:id", async (req, res, next) => {
	const id = Number(req.params.id);
	if (req.body.password)
		req.body.password = await bcrypt.hash(req.body.password, 10);

	try {
		const user = await updateUser(id, req.body);
		const token = jwt.sign({ id: user.id }, "secretOrPrivateKey"); // Create token with user id
		res.status(201).send({ token });
	} catch (error) {
		next(error);
	}
});

// Delete an existing user account
authRouter.delete("/deleteUser/:id", async (req, res, next) => {
	const id = Number(req.params.id);

	try {
		const user = await deleteUser(id, req.body);
		res.status(201).send({ message: "User Deleted: ", user: user });
	} catch (error) {
		next(error);
	}
});

module.exports = authRouter;
