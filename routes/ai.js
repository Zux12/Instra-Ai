const express = require("express");
const User = require("../models/User");
const { findApprovedKnowledge } = require("../services/knowledgeService");
const { generateStandardizedAnswer } = require("../services/openaiService");

const router = express.Router();

router.post("/ask", async (req, res) => {
  try {
    const { email, equipmentType, question } = req.body;

    const cleanEmail = String(email || "").toLowerCase().trim();
    const cleanEquipment = String(equipmentType || "").trim();
    const cleanQuestion = String(question || "").trim();

    if (!cleanEmail || !cleanEquipment || !cleanQuestion) {
      return res.status(400).json({
        success: false,
        message: "Email, equipment type, and question are required."
      });
    }

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    if (user.packageName === "Free") {
      return res.json({
        success: true,
        locked: true,
        response:
          "Your current package is Free. Free users can access general explanation only. Equipment troubleshooting, standards, and tacit field knowledge require a subscribed equipment package."
      });
    }

    if (!user.allowedEquipment.includes(cleanEquipment)) {
      return res.json({
        success: true,
        locked: true,
        response: `${cleanEquipment} is not included in your current subscription package.`
      });
    }

    const approvedKnowledge = await findApprovedKnowledge(
      cleanEquipment,
      cleanQuestion
    );

    if (!approvedKnowledge.length) {
      return res.json({
        success: true,
        response: `No approved knowledge is currently available for ${cleanEquipment}.`
      });
    }

    const response = await generateStandardizedAnswer({
      userQuestion: cleanQuestion,
      equipmentType: cleanEquipment,
      packageName: user.packageName,
      approvedKnowledge
    });

    return res.json({
      success: true,
      locked: false,
      response,
      knowledgeUsed: approvedKnowledge.map((item) => ({
        equipmentType: item.equipmentType,
        issueType: item.issueType,
        confidenceLevel: item.confidenceLevel,
        approvalStatus: item.approvalStatus
      }))
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "AI troubleshooting failed.",
      error: error.message
    });
  }
});

module.exports = router;
