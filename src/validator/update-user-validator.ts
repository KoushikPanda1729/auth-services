import { checkSchema } from "express-validator";
import { IUpdateUserRequest } from "../types";
export default checkSchema({
  gmail: {
    errorMessage: "Gmail is required!",
    notEmpty: true,
    trim: true,
    isEmail: {
      errorMessage: "Invalid email format! Email must contain '@' and '.'",
    },
    normalizeEmail: true,
  },
  firstName: {
    errorMessage: "First name is required!",
    notEmpty: true,
    trim: true,
  },
  lastName: {
    errorMessage: "Last name is required!",
    notEmpty: true,
    trim: true,
  },
  password: {
    optional: true,
    errorMessage: "password is required!",
    notEmpty: true,
    trim: true,
    isLength: {
      options: { min: 4, max: 20 },
      errorMessage: "Password should be at least 4 chars and maximum 20",
    },
  },
  role: {
    errorMessage: "Role is required!",
    notEmpty: true,
    trim: true,
  },
  tenantId: {
    errorMessage: "Tenant id is required!",
    trim: true,
    custom: {
      options: (value: string, { req }) => {
        const role = (req as IUpdateUserRequest).body.role;
        if (role === "admin") {
          return true;
        } else {
          return !!value;
        }
      },
    },
  },
});
