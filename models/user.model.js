const { Sequelize } = require("sequelize");
const userModel = {
	name: "user",
	define: {
		// allowNull defaults to true
		firstName: {
			allowNull: true,
			type: Sequelize.STRING,
		},
		middleName: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		lastName: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		email: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true,
		},
		passwordHash: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		role: {
			type: Sequelize.STRING,
			defaultValue: "customer",
			allowNull: false,
		},
	},
};
module.exports = userModel;
