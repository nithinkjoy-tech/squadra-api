const mongoose = require("mongoose");
const Yup = require("yup");

const roleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: true,
    enum:["Admin","Manager"]
  },
  organizationName: {
    type: String,
    required: true,
    minlength: 3,
  },
  createdDate: {
    type: String,
    required: true,
  },
  roleState: {
    type: String,
    enum: ['Active', 'Inactive'],
  },
  roleId: {
    type: String,
    required: true,
    validate: /^[A-Z]{3}[0-9]{3}$/,
  },
});

const Role = mongoose.model("role", roleSchema);

function validateRole(data) {
  const schema = Yup.object().shape({
    roleName: Yup.string()
      .oneOf(["Admin", "Manager"])
      .required()
      .label("Role Name"),
    organizationName: Yup.string()
      .required()
      .min(3, "Minimum 3 Characters required")
      .label("Organization Name"),
    createdDate: Yup.string().required().label("Created Date"),
    roleState: Yup.string()
      .oneOf(["Active", "Inactive"])
      .required()
      .label("Role State"),
    roleId: Yup.string()
      .required()
      .matches(
        /^[A-Z]{3}[0-9]{3}$/,
        "First 3 characters should be uppercase alphabet and next 3 should be number"
      )
      .label("Role ID"),
  });
  return schema.validate(data);
}

exports.Role = Role;
exports.validateRole = validateRole;