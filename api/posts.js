const router = require("express").Router();
const {
	prisma,
	getAllPosts,
	createPost,
	updatePost,
	deletePost,
	getPostById,
	getPostsByUser,
} = require("../db");
const { protectedRoute } = require("../middleware/middleware");

// Get all posts
router.get("/", async (req, res, next) => {
	try {
		const posts = await getAllPosts();
		res.send(posts);
	} catch (error) {
		next(error);
	}
});

// Get posts by id
router.get("/:id", async (req, res, next) => {
	const postId = Number(req.params.id);
	try {
		const post = await getPostById(postId);
		if (!post)
			return res
				.status(404)
				.send({ message: "Post Not Found: ", post: post });

		res.send(post);
	} catch (error) {
		next(error);
	}
});

// Get posts by user id
router.get("/user/:id", async (req, res, next) => {
	const userId = Number(req.params.id);
	try {
		const post = await getPostsByUser(userId);
		if (!post)
			return res
				.status(404)
				.send({ message: "Posts By User Not Found: ", post: post });

		res.send(post);
	} catch (error) {
		next(error);
	}
});

// Protected Route For Creating A Post
router.post("/createPost", protectedRoute, async (req, res, next) => {
	try {
		const post = await createPost(req.body);

		if (!post) return res.status(404).send("Post Failed To Create.");

		res.status(201).send({ message: "Post Created: ", post: post });
	} catch (error) {
		console.error("Error creating post:", error);
		next(error);
	}
});

// Protected Route For Updating The Post
router.put("/:id", protectedRoute, async (req, res, next) => {
	const postId = Number(req.params.id);
	try {
		const post = await updatePost(postId, req.body);

		if (!post) return res.status(404).send("Post Failed To Update.");

		res.status(201).send({ message: "Post Updated: ", post: post });
	} catch (error) {
		next(error);
	}
});

// Protected Route For Deleting The Post
router.delete("/:id", protectedRoute, async (req, res, next) => {
	const postId = Number(req.params.id);
	try {
		const post = await deletePost(postId);

		if (!post) return res.status(404).send("Post Failed To Delete.");

		res.status(201).send({ message: "Post Deleted: ", post: post });
	} catch (error) {
		next(error);
	}
});

module.exports = router;
