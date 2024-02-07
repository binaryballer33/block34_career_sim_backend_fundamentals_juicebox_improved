const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * USER Methods
 */

async function createUser({ username, password, name }) {
	try {
		const user = await prisma.user.create({
			data: {
				username,
				password,
				name,
			},
		});
		return user;
	} catch (error) {
		throw error;
	}
}

async function getAllUsers() {
	try {
		const users = await prisma.user.findMany();
		return users;
	} catch (error) {
		throw error;
	}
}

async function getUserById(userId) {
	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw {
				name: "UserNotFoundError",
				message: "A user with that id does not exist",
			};
		}
		user.posts = await getPostsByUser(userId);
		return user;
	} catch (error) {
		throw error;
	}
}

async function getUserByUsername(username) {
	try {
		const user = await prisma.user.findUnique({
			where: { username: username },
		});

		if (!user) {
			throw {
				name: "UserNotFoundError",
				message: "A user with that username does not exist",
			};
		}

		return user;
	} catch (error) {
		throw error;
	}
}

async function updateUser(id, fields = {}) {
	if (Object.keys(fields).length === 0) return;

	try {
		const user = await prisma.user.update({
			where: { id: id },
			data: fields,
		});
		return user;
	} catch (error) {
		throw error;
	}
}

/**
 * POST Methods
 */

async function getAllPosts() {
	try {
		const posts = await prisma.post.findMany();
		return posts;
	} catch (error) {
		throw error;
	}
}

async function getPostById(postId) {
	try {
		const post = await prisma.post.findUnique({
			where: { id: postId },
		});
		return post;
	} catch (error) {
		throw error;
	}
}

async function getPostsByUser(userId) {
	try {
		const posts = await prisma.post.findMany({
			where: { authorId: userId },
		});
		return posts;
	} catch (error) {
		throw error;
	}
}

async function createPost({ authorId, title, content }) {
	try {
		const post = await prisma.post.create({
			data: {
				authorId,
				title,
				content,
			},
		});
		return post;
	} catch (error) {
		throw error;
	}
}

async function updatePost(postId, updatedPostData = {}) {
	try {
		const updatedPost = await prisma.post.update({
			where: { id: postId },
			data: updatedPostData,
		});
		return updatedPost;
	} catch (error) {
		throw error;
	}
}

async function deletePost(postId) {
	try {
		const posts = await prisma.post.delete({
			where: { id: postId },
		});
		return posts;
	} catch (error) {
		throw error;
	}
}

module.exports = {
	prisma,
	createUser,
	updateUser,
	getAllUsers,
	getUserById,
	getUserByUsername,
	getPostById,
	createPost,
	updatePost,
	deletePost,
	getAllPosts,
	getPostsByUser,
};
