const mongoose = require("mongoose");
const createHttpError = require("http-errors");

module.exports.notFound = (req, res, next) => {
  next(createHttpError(404, "Route not found"));
};

module.exports.globalHandler = (error, req, res, next) => {
  if (error instanceof mongoose.Error.ValidationError) {
    error = createHttpError(400, error);
  } else if (
    error instanceof mongoose.Error.CastError &&
    error.message.includes("_id")
  ) {
    error = createHttpError(404, "Resource not found");
  } else if (!error.status) {
    error = createHttpError(500, "Internal Server Error");
  }

  const data = {
    message: error.message,
  };

  if (error.errors) {
    data.errors = Object.keys(error.errors).reduce((accErrors, property) => {
      accErrors[property] = error.errors[property].message;
      return accErrors;
    }, {});
  }

  res.status(error.status).json(data);
};
