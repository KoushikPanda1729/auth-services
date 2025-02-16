// import { body } from "express-validator";

// export default [body("gmail").notEmpty().withMessage("Gmail is required ! ")];

import { checkSchema } from "express-validator";
export default checkSchema({
  gmail: {
    errorMessage: "Gmail is required!",
    notEmpty: true,
  },
});
