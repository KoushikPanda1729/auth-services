// import { body } from "express-validator";

// export default [body("gmail").notEmpty().withMessage("Gmail is required ! ")];

import { checkSchema } from "express-validator";
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
    errorMessage: "password is required!",
    notEmpty: true,
    trim: true,
    isLength: {
      options: { min: 4, max: 10 },
      errorMessage: "Password should be at least 8 chars",
    },
  },
});
