const { prisma, createUser, getAllUsers, createPost } = require("./index");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");

async function dropTables() {
	try {
		console.log("Starting to drop tables...");

		// have to make sure to drop in correct order
		await prisma.post.deleteMany();
		await prisma.user.deleteMany();

		// need to do this in order to stop the sequence from continuing to increment
		// and causing a primary key violation when we try to insert new records into the students table
		await prisma.$executeRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1`;
		await prisma.$executeRaw`ALTER SEQUENCE "Post_id_seq" RESTART WITH 1`;

		console.log("Finished dropping tables!");
	} catch (error) {
		console.error("Error dropping tables!");
		throw error;
	}
}

async function createInitialUsers() {
	try {
		console.log("Starting To Create Initial Users...");
		const hashedPassword = await bcrypt.hash("password", 10);

		const adminUser = await createUser({
			name: "Admin",
			username: "admin",
			password: hashedPassword,
		});

		const users = await Promise.all(
			[...Array(4)].map(() =>
				createUser({
					name: faker.person.firstName(),
					username: faker.internet.userName(),
					password: faker.internet.password(),
				})
			)
		);

		users.push(adminUser);

		console.log("Users: ", users);

		console.log("Finished creating users!");
	} catch (error) {
		console.error("Error creating users!");
		throw error;
	}
}

async function createInitialPosts() {
	try {
		console.log("Starting to create posts...");

		const authorIds = (await getAllUsers()).map((user) => user.id);

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

		console.log("Finished creating posts!");
		console.log("Posts: ", posts);
	} catch (error) {
		console.log("Error creating posts!");
		throw error;
	}
}

async function rebuildDB() {
	try {
		await dropTables();
		await createInitialUsers();
		await createInitialPosts();
	} catch (error) {
		console.log("Error during rebuildDB");
		throw error;
	}
}

try {
	rebuildDB();
} catch (error) {
	console.log("Error during rebuildDB", error);
} finally {
	prisma.$disconnect();
}
