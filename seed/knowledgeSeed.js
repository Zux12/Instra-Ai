require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Knowledge = require("../models/Knowledge");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is missing. Add it before running seed.");
  process.exit(1);
}

const seedUsers = [
  {
    name: "Free Demo User",
    email: "free@demo.com",
    password: "demo123",
    role: "user",
    packageName: "Free",
    allowedEquipment: []
  },
  {
    name: "Flow Meter Demo User",
    email: "flow@demo.com",
    password: "demo123",
    role: "user",
    packageName: "Flow Meter Package",
    allowedEquipment: ["Orifice Plate", "Turbine Meter"]
  },
  {
    name: "Admin User",
    email: "admin@demo.com",
    password: "admin123",
    role: "admin",
    packageName: "Enterprise",
    allowedEquipment: [
      "Orifice Plate",
      "Turbine Meter",
      "Ultrasonic Meter",
      "Coriolis Meter",
      "Vortex Meter",
      "Magnetic Flow Meter",
      "Venturi Meter"
    ]
  }
];

const seedKnowledge = [
  {
    packageName: "Flow Meter Package",
    equipmentCategory: "Flow Measurement",
    equipmentType: "Orifice Plate",
    issueType: "Under Reading",
    symptomKeywords: [
      "under reading",
      "low flow",
      "flow reading low",
      "dp low",
      "differential pressure low"
    ],
    problemSummary:
      "The orifice plate flow measurement is indicating lower than expected flow. This may be caused by differential pressure error, impulse line issues, incorrect plate condition, wrong bore data, or process condition mismatch.",
    possibleCauses: [
      "Partially blocked high-pressure impulse line causing lower differential pressure indication.",
      "Leakage in impulse tubing or manifold connection.",
      "Incorrect orifice bore diameter configured in the flow computer or DCS.",
      "Orifice plate installed in the wrong orientation.",
      "Worn or damaged sharp upstream edge of the orifice plate.",
      "Process density, pressure, or temperature compensation error.",
      "Flow below minimum Reynolds number range for reliable measurement."
    ],
    recommendedChecks: [
      "Check high-pressure and low-pressure impulse lines for blockage, leakage, or trapped liquid/gas.",
      "Verify transmitter zero and calibration range.",
      "Confirm orifice plate tag number, bore diameter, beta ratio, and plate orientation.",
      "Inspect the upstream edge of the orifice plate for wear, rounding, nicks, or deposits.",
      "Compare actual process pressure, temperature, and density against flow calculation inputs.",
      "Check flow computer or DCS configuration for correct calculation constants.",
      "Confirm upstream and downstream straight-run conditions."
    ],
    correctiveActions: [
      "Flush or clear blocked impulse lines.",
      "Repair impulse tubing, manifold, or fitting leakages.",
      "Correct flow computer or DCS orifice data if mismatch is found.",
      "Reinstall the orifice plate in the correct orientation.",
      "Replace the orifice plate if the sharp edge is damaged or worn.",
      "Correct pressure, temperature, or density compensation configuration.",
      "Escalate for meter run inspection if installation effects are suspected."
    ],
    relevantStandards: [
      "ISO 5167 - Measurement of fluid flow by means of pressure differential devices",
      "API MPMS Chapter 14.3 - Orifice Metering of Natural Gas",
      "ASME MFC-3M - Measurement of Fluid Flow in Pipes Using Orifice, Nozzle, and Venturi"
    ],
    tacitKnowledge: [
      "In field experience, a low DP reading is often wrongly assumed to be transmitter failure, but impulse line restriction is usually the first practical item to check.",
      "If the orifice plate was recently removed during maintenance, wrong orientation or wrong plate installation should be suspected early.",
      "A damaged or rounded upstream edge can cause systematic under-registration and may not be detected from transmitter calibration alone."
    ],
    escalationGuidance: [
      "Escalate to metering specialist if custody transfer quantity is affected.",
      "Escalate for physical plate inspection if configuration and transmitter checks are normal.",
      "Escalate to process engineer if process properties differ significantly from design basis."
    ],
    confidenceLevel: "High",
    approvalStatus: "Approved",
    createdBy: "System",
    reviewedBy: "Demo Reviewer",
    approvedBy: "Demo Approver"
  },
  {
    packageName: "Flow Meter Package",
    equipmentCategory: "Flow Measurement",
    equipmentType: "Turbine Meter",
    issueType: "Under Reading",
    symptomKeywords: [
      "under reading",
      "low flow",
      "meter factor high",
      "turbine slow",
      "pulse low"
    ],
    problemSummary:
      "The turbine meter is indicating lower than expected flow. This is commonly related to rotor drag, bearing wear, fouling, wrong K-factor, flow profile disturbance, or pulse pickup issues.",
    possibleCauses: [
      "Rotor bearing wear causing additional drag.",
      "Deposits or debris on turbine rotor blades.",
      "Damaged rotor blade or mechanical imbalance.",
      "Incorrect K-factor or meter factor applied in flow computer.",
      "Pulse pickup sensor weak, misaligned, or intermittently failing.",
      "Flow profile distortion due to insufficient straight run or upstream disturbance.",
      "Partially closed upstream valve creating swirl or non-uniform velocity profile.",
      "Flow rate below the minimum linear range of the turbine meter."
    ],
    recommendedChecks: [
      "Compare indicated flow against prover, master meter, or reliable reference if available.",
      "Check pulse output frequency against expected flow rate.",
      "Verify K-factor and meter factor in the flow computer.",
      "Inspect pickup coil, wiring, shielding, and terminal connections.",
      "Check upstream strainer condition for debris or blockage.",
      "Inspect turbine rotor for free rotation, blade damage, deposits, or bearing drag.",
      "Verify upstream/downstream straight run and flow conditioner condition.",
      "Check whether any upstream valve is partially closed or recently operated."
    ],
    correctiveActions: [
      "Clean turbine rotor and meter internals if fouling is found.",
      "Replace worn bearings or damaged rotor assembly.",
      "Correct K-factor or meter factor in the flow computer after verification.",
      "Repair or replace weak pickup sensor or damaged signal wiring.",
      "Clean upstream strainer.",
      "Correct upstream flow disturbance where possible.",
      "Re-prove or recalibrate the meter after mechanical intervention."
    ],
    relevantStandards: [
      "API MPMS Chapter 5.3 - Measurement of Liquid Hydrocarbons by Turbine Meters",
      "API MPMS Chapter 4 - Proving Systems",
      "ISO 2715 - Liquid hydrocarbons, volumetric measurement by turbine meter systems"
    ],
    tacitKnowledge: [
      "A turbine meter that slowly under-reads over time often points to mechanical drag rather than electronic scaling error.",
      "If the issue appears after maintenance, always check whether the K-factor or meter factor was changed or reloaded incorrectly.",
      "In field cases, a partially closed upstream valve can create swirl and cause turbine meter error even when the meter itself is mechanically healthy.",
      "Strainer condition is a high-value first check because debris can affect both rotor movement and flow profile."
    ],
    escalationGuidance: [
      "Escalate to metering specialist if meter proving fails repeatedly.",
      "Escalate for workshop inspection if rotor drag or bearing wear is suspected.",
      "Escalate to operations if valve line-up or flow conditioning issue is suspected."
    ],
    confidenceLevel: "High",
    approvalStatus: "Approved",
    createdBy: "System",
    reviewedBy: "Demo Reviewer",
    approvedBy: "Demo Approver"
  },
  {
    packageName: "Flow Meter Package",
    equipmentCategory: "Flow Measurement",
    equipmentType: "Orifice Plate",
    issueType: "Fluctuating Reading",
    symptomKeywords: [
      "fluctuating",
      "unstable",
      "dp fluctuating",
      "flow hunting",
      "erratic reading"
    ],
    problemSummary:
      "The orifice plate flow measurement is unstable or fluctuating. This may be due to process pulsation, impulse line issues, wet gas/liquid effects, transmitter damping, or control loop interaction.",
    possibleCauses: [
      "Pulsating flow from compressor, pump, or control valve interaction.",
      "Liquid or gas trapped in impulse lines.",
      "Partially blocked impulse line causing delayed pressure response.",
      "Incorrect transmitter damping setting.",
      "Flow near low range or below stable differential pressure region.",
      "Two-phase flow or wet gas condition affecting DP stability."
    ],
    recommendedChecks: [
      "Trend raw differential pressure, static pressure, temperature, and calculated flow.",
      "Check impulse lines for trapped liquid or gas.",
      "Verify transmitter damping and flow computer filtering settings.",
      "Check whether fluctuation follows pump/compressor/control valve operation.",
      "Confirm whether process is single phase or affected by liquid carryover/gas entrainment.",
      "Compare field transmitter reading with DCS or flow computer reading."
    ],
    correctiveActions: [
      "Drain or vent impulse lines according to service requirement.",
      "Adjust damping/filtering only after confirming it will not mask real process instability.",
      "Clear partial impulse line blockage.",
      "Investigate upstream process pulsation source.",
      "Review meter suitability if two-phase flow is confirmed.",
      "Escalate for process and metering review if fluctuation affects custody or allocation."
    ],
    relevantStandards: [
      "ISO 5167 - Measurement of fluid flow by means of pressure differential devices",
      "API MPMS Chapter 14.3 - Orifice Metering of Natural Gas"
    ],
    tacitKnowledge: [
      "Do not immediately increase damping to hide fluctuation. First confirm whether the fluctuation is a real process issue or an instrument impulse-line issue.",
      "Impulse line liquid/gas trapping is a common cause of unstable DP readings, especially after maintenance or line disturbance."
    ],
    escalationGuidance: [
      "Escalate if unstable reading affects custody transfer, allocation, or plant control.",
      "Escalate if fluctuation correlates with compressor or pump operation."
    ],
    confidenceLevel: "Medium",
    approvalStatus: "Approved",
    createdBy: "System",
    reviewedBy: "Demo Reviewer",
    approvedBy: "Demo Approver"
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    await User.deleteMany({});
    await Knowledge.deleteMany({});

    const hashedUsers = await Promise.all(
      seedUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );

    await User.insertMany(hashedUsers);
    await Knowledge.insertMany(seedKnowledge);

    console.log("Seed completed successfully.");
    console.log("Demo users:");
    console.log("free@demo.com / demo123");
    console.log("flow@demo.com / demo123");
    console.log("admin@demo.com / admin123");

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
}

seedDatabase();
