const Sequelize = require("sequelize");
const userPermissionModel = {
	name: "user_permission",
	define: {
		// allowNull defaults to true
		user_id: {
			allowNull: false,
			type: Sequelize.INTEGER,
		},
		permission_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
	},
};

module.exports = userPermissionModel;
