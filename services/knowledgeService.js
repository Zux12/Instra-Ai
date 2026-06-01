const Knowledge = require("../models/Knowledge");

function normalizeText(text) {
  return String(text || "").toLowerCase().trim();
}

async function findApprovedKnowledge(equipmentType, question) {
  const cleanEquipment = String(equipmentType || "").trim();
  const cleanQuestion = normalizeText(question);

  const approvedItems = await Knowledge.find({
    equipmentType: cleanEquipment,
    approvalStatus: "Approved"
  }).lean();

  if (!approvedItems.length) {
    return [];
  }

  const scoredItems = approvedItems.map((item) => {
    let score = 0;

    const issueType = normalizeText(item.issueType);
    const problemSummary = normalizeText(item.problemSummary);

    if (cleanQuestion.includes(issueType)) score += 5;

    if (problemSummary && cleanQuestion.includes(problemSummary)) score += 2;

    for (const keyword of item.symptomKeywords || []) {
      const cleanKeyword = normalizeText(keyword);
      if (cleanKeyword && cleanQuestion.includes(cleanKeyword)) {
        score += 10;
      }
    }

    return {
      ...item,
      matchScore: score
    };
  });

  const matched = scoredItems
    .filter((item) => item.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);

  if (matched.length) {
    return matched.slice(0, 3);
  }

  return approvedItems.slice(0, 2);
}

module.exports = {
  findApprovedKnowledge
};
