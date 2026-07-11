const Contact = require("../lib/models/contact.model");
const createHttpError = require("../middlewares");

module.exports.list = async (req, res, next) => {
  const { name } = req.query;

  const criterial = {};

  if (name) {
    criterial.name = { $regex: name, $options: "i" };
  }

  const contacts = await Contact.find(criterial);
  res.json(contacts);
};

module.exports.create = async (req, res, next) => {
  const contact = await Contact.create(req.body);
  res.status(201).json(contact);
};

module.exports.detail = async (req, res, next) => {
  const { id } = req.params;
  const contact = await Contact.findById(id);

  if (contact) {
    res.json(contact);
  } else {
    next(createHttpError(404, "Contact not found"));
  }
};

module.exports.update = async (req, res, next) => {
  const { id } = req.params;
  const contact = await Contact.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    returnDocument: "after",
  });
  if (contact) {
    res.json(contact);
  } else {
    next(createHttpError(404, "Contact not found"));
  }
};

module.exports.remove = async (req, res, next) => {
  const { id } = req.params;
  const contact = await Contact.findByIdAndDelete(id);
  if (contact) {
    res.status(204).send();
  } else {
    next(createHttpError(404, "Contact not found"));
  }
};
