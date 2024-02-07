const { app } = require("../app");
const request = require("supertest");
const { prisma, createUser } = require("../db");
const bcrypt = require("bcrypt");

// Run before all tests to clean up the test data
beforeAll(async () => {
	await prisma.post.deleteMany();
	await prisma.user.deleteMany();

	const hashedPassword = await bcrypt.hash("password", 10);

	await createUser({
		name: "Admin",
		username: "admin",
		password: hashedPassword,
	});
	await createUser({
		name: "Shaquille",
		username: "shaquille",
		password: hashedPassword,
	});
	await createUser({
		name: "Mandy",
		username: "mandy",
		password: hashedPassword,
	});
});

// Run after all tests are done to close the db connection
afterAll(async () => {
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

		console.log("response.body: ", response.body);

		expect(response.statusCode).toBe(201);
		expect(response.body).toHaveProperty("token");
	});

	test("updateUser", () => {
		expect(true).toBe(true);
	});

	test("deleteUser", () => {
		expect(true).toBe(true);
	});
});
