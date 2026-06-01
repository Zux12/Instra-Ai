const express = require("express");
const Knowledge = require("../models/Knowledge");
const User = require("../models/User");

const router = express.Router();

router.get("/knowledge", async (req, res) => {
  try {
    const knowledge = await Knowledge.find().sort({ createdAt: -1 }).lean();

    return res.json({
      success: true,
      knowledge
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load knowledge.",
      error: error.message
    });
  }
});

router.post("/knowledge", async (req, res) => {
  try {
    const newKnowledge = await Knowledge.create(req.body);

    return res.json({
      success: true,
      message: "Knowledge created successfully.",
      knowledge: newKnowledge
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create knowledge.",
      error: error.message
    });
  }
});

router.patch("/knowledge/:id/status", async (req, res) => {
  try {
    const { approvalStatus, reviewedBy, approvedBy } = req.body;

    const updated = await Knowledge.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus,
        reviewedBy: reviewedBy || "",
        approvedBy: approvedBy || ""
      },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Knowledge status updated.",
      knowledge: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update knowledge status.",
      error: error.message
    });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load users.",
      error: error.message
    });
  }
});

module.exports = router;
