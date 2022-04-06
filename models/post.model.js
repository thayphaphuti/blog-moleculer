const Sequelize = require("sequelize");
const postModel = {
	name: "post",
	define: {
		title: Sequelize.STRING,
		content: Sequelize.STRING,
		authorId: {
			type: Sequelize.INTEGER,
			references: {
				model: "users",
				key: "id",
			},
		},
	},
};

module.exports = postModel;
