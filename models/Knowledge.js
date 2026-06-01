const mongoose = require("mongoose");

const knowledgeSchema = new mongoose.Schema(
  {
    packageName: {
      type: String,
      required: true
    },

    equipmentCategory: {
      type: String,
      required: true
    },

    equipmentType: {
      type: String,
      required: true
    },

    issueType: {
      type: String,
      required: true
    },

    symptomKeywords: {
      type: [String],
      default: []
    },

    problemSummary: {
      type: String,
      required: true
    },

    possibleCauses: {
      type: [String],
      default: []
    },

    recommendedChecks: {
      type: [String],
      default: []
    },

    correctiveActions: {
      type: [String],
      default: []
    },

    relevantStandards: {
      type: [String],
      default: []
    },

    tacitKnowledge: {
      type: [String],
      default: []
    },

    escalationGuidance: {
      type: [String],
      default: []
    },

    confidenceLevel: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium"
    },

    approvalStatus: {
      type: String,
      enum: ["Draft", "Reviewed", "Approved", "Rejected"],
      default: "Draft"
    },

    createdBy: {
      type: String,
      default: "System"
    },

    reviewedBy: {
      type: String,
      default: ""
    },

    approvedBy: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Knowledge", knowledgeSchema);
