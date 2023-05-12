const mongoose = require("mongoose");
const Yup = require("yup");

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  companyEmail: {
    type: String,
    required: true,
  },
  validTill: {
    type: String,
    required: true,
  },
  organizationName: {
    type: String,
    required: true,
    minlength: 3,
  },
  companyId: {
    type: String,
    required: true,
    validate: /^[A-Z]{3}[0-9]{3}$/,
  },
});

const Company = mongoose.model("company", companySchema);

function validateCompany(data) {
  const schema = Yup.object().shape({
    companyName: Yup.string()
      .required()
      .min(3, "minimum 3 characters long")
      .matches(/\w+[\s\w]*\w+/g, "Invalid Company Name")
      .label("Name"),
    companyEmail: Yup.string()
      .required()
      .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g, "Should be a valid email")
      .label("Company Email"),
    validTill: Yup.string().required().label("Date"),
    organizationName: Yup.string()
      .required()
      .min(3, "Minimum 3 Characters required")
      .label("Organization Name"),
    companyId: Yup.string()
      .required()
      .matches(
        /^[A-Z]{3}[0-9]{3}$/,
        "First 3 characters should be uppercase alphabet and next 3 should be number"
      )
      .label("Company ID"),
  });
  return schema.validate(data);
}

exports.Company = Company;
exports.validateCompany = validateCompany;
