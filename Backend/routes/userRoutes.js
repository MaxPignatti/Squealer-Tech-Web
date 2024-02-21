const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.get("/usr/email/:email", validate, userController.getUserByEmail);
router
  .route("/usr/:username")
  .patch(validate, userController.updateUserProfile)
  .get(validate, userController.getUser);
router.patch(
  "/usr/:username/password",
  validate,
  userController.updateUserPassword
);
router.get("/usr", userController.getAllUsers);
router.patch("/usr/:username/chars", validate, userController.updateUserChars);
router.delete("/api/deleteUser/:username", validate, userController.deleteUser);
router.patch("/usr/:username/block", validate, userController.toggleBlockUser);
router.patch("/usr/:username/mod", validate, userController.toggleModUser);
router.patch(
  "/usr/:username/proStatus",
  validate,
  userController.handleProAction
);
router.patch(
  "/usr/:username/proAcceptance",
  validate,
  userController.proAcceptance
);

module.exports = router;
