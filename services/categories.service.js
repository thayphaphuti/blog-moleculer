const categoryModel = require("../models/category.model");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const {
	Get,
	Create,
	Update,
	Delete,
	NotFound,
	Response,
} = require("../lib/response");
const Redis = require("ioredis");
const redis = new Redis();
const ONE_DAY = 24 * 60 * 60;
module.exports = {
	name: "categories",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: categoryModel,
	settings: {
		fields: ["id", "title", "content"],
	},
	actions: {
		list: {
			rest: "GET /",
			auth: "required",
			async handler(ctx) {
				console.log("model:", this.model);
				const categoriesRedis = await redis.get("categories");
				let data = JSON.parse(categoriesRedis);
				console.log(this.adapter.service.schema);
				if (!data) {
					data = await this.adapter.find({});
					await redis.setex(
						"categories",
						ONE_DAY,
						JSON.stringify(data)
					);
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
				const category = await this.adapter.insert(ctx.params);
				await this.saveCategoriesInRedis();
				return Create(ctx, null, category);
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
					return NotFound(ctx, "Category");
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
				const checkEntryExist = await this.findExistsCategory(id);
				if (checkEntryExist) {
					const updatedAt = new Date();
					const updatedCategory = {
						content,
						updatedAt,
					};
					const data = await this.adapter.updateById(id, {
						$set: updatedCategory,
					});
					await this.saveCategoriesInRedis();
					return Update(ctx, data);
				} else {
					return NotFound(ctx, "Category");
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
				const checkEntryExist = await this.findExistsCategory(id);
				if (checkEntryExist) {
					const data = await this.adapter.removeById(id);
					await this.saveCategoriesInRedis();
					return Delete(ctx, data);
				} else {
					return NotFound(ctx, "Category");
				}
			},
		},
	},
	methods: {
		async saveCategoriesInRedis() {
			const categories = await this.adapter.find({});
			await redis.setex(
				"categories",
				ONE_DAY,
				JSON.stringify(categories)
			);
		},
		async findExistsCategory(id) {
			const entityExists = await this.adapter.findOne({
				where: {
					id,
				},
			});
			if (!entityExists) return false;
			return true;
		},
	},
};
