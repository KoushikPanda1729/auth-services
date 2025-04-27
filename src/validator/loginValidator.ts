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
  password: {
    errorMessage: "password is required!",
    notEmpty: true,
    trim: true,
  },
});
