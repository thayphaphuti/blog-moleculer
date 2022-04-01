const categoryModel = require("../models/category.model");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
module.exports = {
	name: "categories",
	mixins: [DbService],
	adapter: new SqlAdapter("blog_api", "user-dev", "moleculer", {
		host: "localhost",
		dialect: "mysql",
	}),
	model: categoryModel,
	settings: {
		fields: ["id", "title", "content"],
	},
	actions: {
		list: {
			cache: {
				enabled: true,
			},
			path: "GET /",
			auth: "required",
			async handler(ctx) {
				const docs = await this.adapter.find({});
				return docs;
			},
		},
		// hooks in action level
		create: {
			// hooks: {
			// 	before(ctx) {
			// 		ctx.params.category.createdAt = new Date();
			// 		return ctx;
			// 	},
			// },
			auth: "required",
			rest: "POST /",
			params: {
				title: "string",
				content: "string",
			},
			async handler(ctx) {
				// const { title, content } = ctx.params;
				const doc = await this.adapter.insert(ctx.params);
				return doc;
			},
		},
		get: {
			rest: "GET /:id",
			auth: "required",
			params: {
				id: { type: "string" },
			},
			async handler(ctx) {
				const doc = await this.adapter.findById(ctx.params.id);
				return doc;
			},
		},
		update: {
			rest: "PUT /:id",
			auth: "required",
			params: {
				content: { type: "string" },
				id: { type: "string" },
			},
			async handler(ctx) {
				const updatedAt = new Date();
				const updatedCategory = {
					content: ctx.params.content,
					updatedAt,
				};
				const doc = await this.adapter.updateById(ctx.params.id, {
					$set: updatedCategory,
				});
				return doc;
			},
		},
		remove: {
			rest: "DELETE /:id",
			auth: "required",
			params: {
				id: { type: "string" },
			},
			async handler(ctx) {
				const doc = await this.adapter.removeById(ctx.params.id);
				return doc;
			},
		},
	},
};
