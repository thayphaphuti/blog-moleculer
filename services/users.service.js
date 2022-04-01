const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const { MoleculerServerError } = require("moleculer").Errors;
const userModel = require("../models/user.model");
module.exports = {
	name: "users",
	mixins: [DbService],
	adapter: new SqlAdapter("blog_api", "user-dev", "moleculer", {
		host: "localhost",
		dialect: "mysql",
	}),
	model: userModel,
	cacher: {
		type: "Redis",
		options: {
			// set Time-to-live to 30sec.
			ttl: 60 * 60,
			// Redis settings
			redis: {
				port: 6379,
				host: "127.0.0.1",
			},
		},
	},
	settings: {
		/** Public fields */
		fields: ["firstName", "middleName", "lastName", "email"],
		// populates: {
		// 	permissions: {
		// 		action: "user-permissions.getPermission",
		// 		params: {
		// 			fields: ["userId"],
		// 		},
		// 	},
		// },
	},

	// hooks: {
	// 	after: {
	// 		"*": function (ctx, res) {
	// 			ctx.meta.$responseHeaders = {
	// 				Authorization: `Beaer ${res.data.token}`,
	// 			};
	// 			ctx.meta.token = res.data.token;
	// 			// console.log("headers", ctx.meta);
	// 			delete ctx.params.password;
	// 			delete ctx.params.passwordHash;
	// 			// Please note, must return result (either the original or a new)
	// 			return res;
	// 		},
	// 	},
	// },

	actions: {
		signup: {
			rest: "POST /signup",
			params: {
				firstName: "string",
				middleName: "string",
				lastName: "string",
				email: "email",
				password: "string|min:6",
			},
			hooks: {
				before(ctx) {
					ctx.params.passwordHash = this.hashPassword(
						ctx.params.password
					);
					return ctx;
				},
			},
			async handler(ctx) {
				const entity = ctx.params;
				// console.log("entity", entity.email);
				const entityExists = await this.adapter.findOne({
					where: {
						email: entity.email,
					},
				});
				// const entityExists = await this.adapter.db.query(
				// 	`SELECT * FROM users WHERE email = "${entity.email}"`
				// );
				// console.log("entityExists", entityExists);
				if (entityExists) {
					throw new MoleculerServerError(
						"Email already register",
						400
					);
				}
				const user = await this.adapter.insert(entity);
				const userInfo = {
					email: user.email,
					firstName: user.firstName,
				};

				return { data: userInfo };
			},
		},
		signin: {
			rest: "POST /signin",
			cache: {
				enabled: true,
			},
			params: {
				email: "email",
				password: "string|min:6",
			},

			async handler(ctx) {
				const entity = ctx.params;
				const entityExists = await this.adapter.findOne({
					where: {
						email: entity.email,
					},
				});
				// const entityExists = await this.adapter.db.query(
				// 	`SELECT * FROM users WHERE email = "${entity.email}"`
				// );
				if (!entityExists) {
					throw new MoleculerServerError("Email not registered", 422);
				}
				// console.log("entityExists", entityExists);
				const user = entityExists.dataValues;
				const checkPassword = this.comparePassword(
					user.passwordHash,
					entity.password
				);
				if (!checkPassword) {
					throw new MoleculerServerError("Wrong password!", 422);
				}
				const permissions = await ctx.call(
					"user-permissions.getPermission",
					{
						userId: user.id,
					}
				);
				// const timestamps = new Date();
				const payload = {
					permissions,
					userId: user.id,
				};
				const token = this.generateJWT(payload);

				return { data: { token } };
			},
		},
		resolveToken: {
			params: {
				token: "string",
			},
			handler(ctx) {
				const decode = jwt.verify(
					ctx.params.token,
					process.env.JWT_SECRET
				);
				return decode;
			},
		},
		addPermission: {
			rest: "POST /add-permission/:userId",
			params: {
				userId: "string",
				permissionId: "number",
			},
			async handler(ctx) {
				const { userId, permissionId } = ctx.params;
				const document = await ctx.call(
					"user-permissions.addPermission",
					{ userId, permissionId }
				);
				console.log("document user", document);
				return document;
			},
		},
		deletePermission: {
			rest: "DELETE /delete-permission/:userId",
			params: {
				userId: "string",
				permissionId: "number",
			},
			async handler(ctx) {
				const { userId, permissionId } = ctx.params;
				const document = await ctx.call(
					"user-permissions.deletePermission",
					{ userId, permissionId }
				);
				return document;
			},
		},
	},
	methods: {
		hashPassword(password) {
			const salt = bcrypt.genSaltSync(10);
			const hash = bcrypt.hashSync(password, salt);
			return hash;
		},
		comparePassword(passwordHash, password) {
			const check = bcrypt.compareSync(password, passwordHash);
			return check;
		},
		//  * Generate a JWT token from user entity
		generateJWT(user) {
			const token = jwt.sign(
				{
					data: user,
				},
				process.env.JWT_SECRET,
				{ expiresIn: process.env.JWT_EXPIRES }
			);
			return token;
		},
		// // * Transform returned user entity. Generate JWT token if neccessary.
		// saveToken(user, withToken, token) {
		// 	if (user) {
		// 		if (withToken) user.token = token || this.generateJWT(user);
		// 	}
		// 	return user;
		// },
	},
};
