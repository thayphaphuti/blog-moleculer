const Sequelize = require("sequelize");
const categoryModel = {
	name: "category",
	define: {
		title: Sequelize.STRING,
		content: Sequelize.STRING,
	},
};

module.exports = categoryModel;
