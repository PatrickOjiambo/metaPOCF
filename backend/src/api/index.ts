import express from "express";

import type MessageResponse from "../interfaces/message-response.js";
import adminRoutes from "../routes/admin.routes.js";
import userRoutes from "../routes/user.routes.js";
import emojis from "./emojis.js";

const router = express.Router();

router.get<object, MessageResponse>("/", (req, res) => {
  res.json({
    message: "Casper Prize Vault API v1",
  });
});

router.use("/emojis", emojis);
router.use("/", userRoutes);
router.use("/admin", adminRoutes);

export default router;
