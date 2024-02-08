const { app } = require("../app");
const request = require("supertest");
const { prisma, createUser, getAllUsers, createPost } = require("../db");
const bcrypt = require("bcrypt");
const { faker } = require("@faker-js/faker");

// Run before all tests to clean up the test data
beforeAll(async () => {
	console.log("Setting Up Test Data");
	console.log("Deleting all data from the User and Post tables");
	await prisma.post.deleteMany();
	await prisma.user.deleteMany();

	// need to do this in order to stop the sequence from continuing to increment
	// and causing a primary key violation when we try to insert new records into the students table
	await prisma.$executeRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1`;
	await prisma.$executeRaw`ALTER SEQUENCE "Post_id_seq" RESTART WITH 1`;

	const hashedPassword = await bcrypt.hash("password", 10);

	console.log("Creating 5 Users");
	const users = await Promise.all(
		[...Array(4)].map(() =>
			createUser({
				name: faker.person.firstName(),
				username: faker.internet.userName(),
				password: faker.internet.password(),
			})
		)
	);

	const adminUser = await createUser({
		name: "Admin",
		username: "admin",
		password: hashedPassword,
	});

	users.push(adminUser);

	const authorIds = (await getAllUsers()).map((user) => user.id);

	console.log("Creating 10 Posts");
	const posts = await Promise.all(
		[...Array(10)].map(() =>
			createPost({
				title: faker.lorem.word(),
				content: faker.lorem.paragraph(),
				authorId:
					authorIds[Math.floor(Math.random() * authorIds.length)],
			})
		)
	);
});

// Run after all tests are done to close the db connection
afterAll(async () => {
	console.log("Disconnecting Prisma Client");
	prisma.$disconnect;
});

describe("Auth", () => {
	test("getAllUsers", async () => {
		const response = await request(app).get("/auth");
		expect(response.statusCode).toBe(200);
		expect(
			Array.isArray(response.body.users) && response.body.users.length > 0
		).toBeTruthy();
	});

	test("register", async () => {
		const hashedPassword = await bcrypt.hash("password", 10);

		const response = await request(app).post("/auth/register").send({
			name: "Test User",
			username: "testuser",
			password: hashedPassword,
		});

		expect(response.statusCode).toBe(201);
		expect(response.body).toHaveProperty("token");
	});

	test("login", async () => {
		const response = await request(app).post("/auth/login").send({
			username: "admin",
			password: "password",
		});

		expect(response.statusCode).toBe(201);
		expect(response.body).toHaveProperty("token");
	});

	test("updateUser", async () => {
		const response = await request(app).put("/auth/updateUser/3").send({
			username: "updatedUsername",
			password: "password",
		});

		expect(response.statusCode).toBe(201);
	});

	test("deleteUser", async () => {
		// have to delete all posts by the user first, due to their foreign key constraint relationship
		await prisma.post.deleteMany({ where: { authorId: 2 } });

		// then we can delete the user
		const response = await request(app).delete("/auth/deleteUser/2");

		expect(response.statusCode).toBe(201);
	});
});
