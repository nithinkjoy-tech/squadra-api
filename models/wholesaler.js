const mongoose = require("mongoose");
const Yup = require("yup");

const wholesalerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    validate: /^[A-Za-z]+$/,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50,
    validate: /^[A-Za-z]+$/,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    minlength: 10,
    maxlength: 10,
    validate: /^[6789]\d{9}$/,
  },
  wholesalerId: {
    type: String,
    required: true,
    validate: /^[A-Z]{3}[0-9]{3}$/,
  },
  role: {
    type: String,
    required: true,
    enum:["Admin","Manager"]
  },
  locId: {
    type: String,
    required: true,
    validate: /^[A-Z]{3}[0-9]{6}$/,
  },
});

const Wholesaler = mongoose.model("wholesaler", wholesalerSchema);

function validateWholesaler(data) {
  const schema = Yup.object().shape({
    firstName: Yup.string()
      .required()
      .min(2, "minimum 2 characters long")
      .matches(/^[A-Za-z]+$/, "Only alphabets allowed")
      .label("First Name"),
    lastName: Yup.string()
      .required()
      .min(1, "minimum 1 characters long")
      .matches(/^[A-Za-z]+$/, "Only alphabets allowed")
      .label("Last Name"),
    email: Yup.string()
      .required()
      .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,3}$/g, "Should be a valid email")
      .label("Email"),
    phoneNumber: Yup.string()
      .required()
      .matches(/^[6789]\d{9}$/, "Invalid Phone number")
      .label("Phone Number"),
    wholesalerId: Yup.string()
      .required()
      .matches(
        /^[A-Z]{3}[0-9]{3}$/,
        "First 3 characters should be uppercase alphabet and next 3 should be number"
      )
      .label("Wholesaler ID"),
    role: Yup.string()
      .oneOf(["Admin", "Manager"])
      .required()
      .label("Role"),
    locId: Yup.string()
      .required()
      .matches(
        /^[A-Z]{3}[0-9]{6}$/,
        "First 3 characters should be uppercase alphabet and next 6 should be number"
      )
      .label("LOC ID"),
  });
  return schema.validate(data);
}

exports.Wholesaler = Wholesaler;
exports.validateWholesaler = validateWholesaler;
