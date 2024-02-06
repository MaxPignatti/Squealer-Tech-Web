const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { body, validationResult } = require("express-validator");

// Middleware per controllare i risultati della validazione
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post(
  "/loginSMM",
  [
    body("email")
      .isEmail()
      .withMessage("Deve essere un'email valida.")
      .normalizeEmail()
      .toString(),
    body("password").trim().escape().toString(),
  ],
  validate,
  authController.loginSMM
);

router.post(
  "/register",
  [
    body("username").isString().trim().escape().toString(),

    body("password").isLength({ min: 5 }).trim().escape().toString(),

    body("email").isEmail().normalizeEmail().toString(),

    body("firstName").optional().trim().escape().toString(),

    body("lastName").optional().trim().escape().toString(),
  ],
  validate,
  authController.register
);

router.post(
  "/login",
  [
    body("username").isString().trim().escape(),

    body("password").trim().escape().toString(),
  ],
  validate,
  authController.login
);

router.post("/protectedEndpoint", validate, authController.protectedEndpoint);

router.get("/verifyTokenSMM", validate, authController.verifyTokenSMM);

router.post(
  "/loginMod",
  [
    body("username").isString().trim().escape(),

    body("password").trim().escape().toString(),
  ],
  validate,
  authController.loginMod
);
