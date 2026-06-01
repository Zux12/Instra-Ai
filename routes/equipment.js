const express = require("express");
const User = require("../models/User");

const router = express.Router();

const allFlowEquipment = [
  "Orifice Plate",
  "Turbine Meter",
  "Ultrasonic Meter",
  "Coriolis Meter",
  "Vortex Meter",
  "Magnetic Flow Meter",
  "Venturi Meter"
];

router.get("/:email", async (req, res) => {
  try {
    const email = String(req.params.email || "").toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const unlocked = user.allowedEquipment || [];

    const equipment = allFlowEquipment.map((item) => ({
      name: item,
      unlocked: unlocked.includes(item)
    }));

    return res.json({
      success: true,
      packageName: user.packageName,
      equipment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve equipment access.",
      error: error.message
    });
  }
});

module.exports = router;
