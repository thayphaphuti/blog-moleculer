const postModel = require("../models/post.model");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const {
	Get,
	Create,
	Update,
	Delete,
	NotFound,
	Response,
	BadRequest,
} = require("../lib/response");
const Redis = require("ioredis");
const redis = new Redis();
const ONE_DAY = 24 * 60 * 60;
module.exports = {
	name: "posts",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: postModel,
	settings: {
		fields: ["id", "title", "content"],
	},
	actions: {
		list: {
			rest: "GET /",
			auth: "required",
			async handler(ctx) {
				const postRedis = await redis.get("post");
				let data = JSON.parse(postRedis);
				if (!data) {
					data = await this.adapter.find({});
					await redis.setex("posts", ONE_DAY, JSON.stringify(data));
					return Get(ctx, data);
				}

				return Get(ctx, data);
			},
		},
		// hooks in action level
		create: {
			auth: "required",
			rest: "POST /",
			params: {
				title: "string",
				content: "string",
			},
			async handler(ctx) {
				// const { title, content } = ctx.params;
				const { userId: authorId } = ctx.meta.user;
				const post = await this.adapter.insert({
					...ctx.params,
					authorId,
				});
				// await this.saveCategoriesInRedis();
				return Create(ctx, null, post);
			},
		},
		get: {
			rest: "GET /:id",
			auth: "required",
			params: {
				id: { type: "string" },
			},
			async handler(ctx) {
				const { id } = ctx.params;
				const data = await this.adapter.findById(id);
				if (data) {
					return Get(ctx, data);
				} else {
					return NotFound(ctx, "Post");
				}
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
				const { id, content } = ctx.params;
				const { userId } = ctx.meta.user;
				const checkEntryExist = await this.adapter.findById(id);
				console.log("checkEntryExist", checkEntryExist);
				if (checkEntryExist) {
					if (checkEntryExist.dataValues.authorId === userId) {
						const updatedAt = new Date();
						const updataPost = {
							content,
							updatedAt,
						};
						const data = await this.adapter.updateById(id, {
							$set: updataPost,
						});
						return Update(ctx, data);
					} else {
						return BadRequest(ctx, "Cannot update Post");
					}
				} else {
					return NotFound(ctx, "Post");
				}
			},
		},
		delete: {
			rest: "DELETE /:id",
			auth: "required",
			params: {
				id: { type: "string" },
			},
			async handler(ctx) {
				const { id } = ctx.params;
				const { userId } = ctx.meta.user;
				const checkEntryExist = await this.adapter.findById(id);
				if (checkEntryExist) {
					if (checkEntryExist.dataValues.authorId === userId) {
						const data = await this.adapter.removeById(id);
						return Delete(ctx, data);
					} else {
						return BadRequest(ctx, "Cannot delete post");
					}
				} else {
					return NotFound(ctx, "Category");
				}
			},
		},
	},
};
