const { app } = require("./app");
const PORT = 3000;

app.listen(PORT, () => {
	console.log("The server is up on port", PORT);
});
