const Sequelize = require("sequelize");

const userPermissionModel = {
	name: "user_permission",
	define: {
		// allowNull defaults to true
		user_id: {
			allowNull: false,
			type: Sequelize.INTEGER,
			references: {
				model: "users",
				key: "id",
			},
		},
		permission_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
	},
};
module.exports = userPermissionModel;
