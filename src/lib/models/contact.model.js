const mongoose = require("mongoose");
const validator = require("validator");
const Schema = mongoose.Schema;

const conctactSchema = new Schema(
  {
    name: {
      type: String,
      required: "Name is required",
      minLength: [3, "Name must be at least 3 characters long"],
      maxLength: [16, "Name can't be more than 16 characters long"],
    },
    age: Number,
    birthdate: Date,
    email: {
      type: String,
      required: "Email is required",
      unique: true,
      validate: [validator.isEmail, "Introduce a valid Email"],
    },
    phone: String,
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = doc.id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

const Contact = mongoose.model("Contact", conctactSchema);
module.exports = Contact;