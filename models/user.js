const mongoose = require("mongoose");
const Yup = require("yup");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    validate:/^[A-Za-z]+$/
  },
  lastName: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50,
    validate:/^[A-Za-z]+$/
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    minlength: 10,
    maxlength: 10,
    validate:/^[6789]\d{9}$/
  },
  companyName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 1024,
  },
  userState: {
    type: String,
    enum: ['Active', 'Inactive'],
  }
});

const User = mongoose.model("user", userSchema);

function validateUser(data) {
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
      .label("Company Email"),
    phoneNumber: Yup.string()
      .required()
      .matches(/^[6789]\d{9}$/, "Invalid Phone number")
      .label("Phone Number"),
    companyName: Yup.string()
      .required()
      .min(3, "Minimum 3 Characters required")
      .label("Company Name"),
    userState: Yup.string()
      .oneOf(["Active", "Inactive"])
      .required()
      .label("User State"),
  });
  return schema.validate(data);
}

exports.User = User;
exports.validateUser = validateUser;