const { StatusCodes } = require("http-status-codes");

const message = {
	GET: "Get completed",
	CREATE: "Create completed",
	UPDATE: "Update completed",
	DELETE: "Delete completed",
	UNAUTHENTICATE: "Signin is required",
	UNAUTHORIZE: "Not allowed to access",
};
const Response = (ctx, data, httpStatus = StatusCodes.OK) => {
	ctx.meta.$statusCode = httpStatus;
	return data;
};

const Get = (ctx, data) => {
	return Response(ctx, { message: message.GET, data }, StatusCodes.OK);
};
const Create = (ctx, msg, data) => {
	return Response(
		ctx,
		{ message: `${msg === null ? message.CREATE : msg}`, data },
		StatusCodes.CREATED
	);
};
const Update = (ctx, data) => {
	return Response(ctx, {
		message: message.UPDATE,
		data,
	});
};

const Delete = (ctx, data) => {
	return Response(ctx, {
		message: message.DELETE,
		data,
	});
};
const ServerError = (ctx, message) => {
	return Response(ctx, { message }, StatusCodes.INTERNAL_SERVER_ERROR);
};
// yeu cau signin
const Unauthenticated = (ctx) => {
	return Response(
		ctx,
		{ message: message.UNAUTHENTICATE },
		StatusCodes.UNAUTHORIZED
	);
};
// ko cho phep
const Unauthorized = (ctx) => {
	return Response(
		ctx,
		{ message: message.UNAUTHORIZE },
		StatusCodes.FORBIDDEN
	);
};

const BadRequest = (ctx, message) => {
	return Response(ctx, { message }, StatusCodes.BAD_REQUEST);
};

const NotFound = (ctx, input) => {
	return Response(
		ctx,
		{ message: `${input} not found` },
		StatusCodes.NOT_FOUND
	);
};
const InputError = (ctx, message) => {
	return Response(ctx, message, StatusCodes.UNPROCESSABLE_ENTITY);
};
module.exports = {
	Response,
	Get,
	Create,
	Update,
	Delete,
	BadRequest,
	Unauthenticated,
	Unauthorized,
	NotFound,
	ServerError,
	InputError,
};
