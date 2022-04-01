const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const _ = require("lodash");
const { QueryTypes } = require("sequelize");
const userPermission = require("../models/user-permission.model");
const { ValidationError, MoleculerServerError } = require("moleculer").Errors;
module.exports = {
	name: "user-permissions",
	mixins: [DbService],
	adapter: new SqlAdapter("blog_api", "user-dev", "moleculer", {
		host: "localhost",
		dialect: "mysql",
	}),
	model: userPermission,
	settings: {
		/** Public fields */
		routes: [],
	},

	actions: {
		getPermission: {
			rest: "GET /",
			params: {
				userId: "number",
			},
			async handler(ctx) {
				const userId = ctx.params.userId;
				// console.log("entity", entity.email);
				// console.log("userId", userId);
				const document = await this.adapter.db.query(
					"SELECT resource, action FROM permissions, user_permissions WHERE user_permissions.user_id = :userId AND user_permissions.permission_id=permissions.id",
					{
						replacements: { userId },
						type: QueryTypes.SELECT,
					}
				);
				let permission = {};
				_.forEach(document, (value) => {
					const resource = value.resource;
					const action = value.action;
					// console.log('permission[resource]', permission[resource]);
					// console.log('action', action);
					permission[resource]
						? permission[resource].push(action)
						: (permission[resource] = [action]);
				});
				return permission;
			},
		},
		addPermission: {
			rest: "POST /",
			params: {
				userId: "string",
				permissionId: "number",
			},
			async handler(ctx) {
				const { userId, permissionId } = ctx.params;
				const permissionExists = await this.adapter.findOne({
					where: { user_id: userId, permission_id: permissionId },
				});
				// console.log("permissionExists", permissionExists);
				if (permissionExists) {
					throw new ValidationError("Permission already exists");
				}
				const document = await this.adapter.insert({
					user_id: Number(userId),
					permission_id: permissionId,
				});

				// // console.log("document permission", document);
				return document;
			},
		},
		deletePermission: {
			rest: "DELETE /",
			params: {
				userId: "string",
				permissionId: "number",
			},
			async handler(ctx) {
				let { userId, permissionId } = ctx.params;
				const permissionExists = await this.adapter.findOne({
					where: { user_id: userId, permission_id: permissionId },
				});
				// console.log("permissionExists", permissionExists);
				if (!permissionExists) {
					throw new MoleculerServerError("Permission not found", 404);
				}
				userId = Number(userId);
				await this.adapter.db.query(
					"DELETE FROM user_permissions WHERE user_id = ? AND permission_id= ?",
					{
						replacements: [userId, permissionId],
						type: QueryTypes.DELETE,
					}
				);
				return permissionExists.dataValues;
			},
		},
	},
	methods: {},
};
