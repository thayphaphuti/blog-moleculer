// authorize.mixin.js
module.exports = {
	methods: {
		checkIsAuthenticated(ctx) {
			console.log("auth", ctx.options.parentCtx.params.req.rawHeaders[1]);
			return 1;
		},
	},
};
