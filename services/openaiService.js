const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function buildFallbackAnswer({
  userQuestion,
  equipmentType,
  packageName,
  approvedKnowledge
}) {
  const k = approvedKnowledge[0];

  return `
1. Problem Summary
${k.problemSummary || userQuestion}

2. Equipment Involved
${equipmentType}

3. Most Likely Causes
${(k.possibleCauses || []).map((x, i) => `${i + 1}. ${x}`).join("\n")}

4. Step-by-Step Checks
${(k.recommendedChecks || []).map((x, i) => `${i + 1}. ${x}`).join("\n")}

5. Corrective Actions
${(k.correctiveActions || []).map((x, i) => `${i + 1}. ${x}`).join("\n")}

6. Relevant Standards
${(k.relevantStandards || []).map((x, i) => `${i + 1}. ${x}`).join("\n")}

7. Tacit Knowledge / Field Experience
${(k.tacitKnowledge || []).map((x, i) => `${i + 1}. ${x}`).join("\n")}

8. Confidence Level
${k.confidenceLevel || "Medium"}

9. When to Escalate
${(k.escalationGuidance || []).map((x, i) => `${i + 1}. ${x}`).join("\n")}

Note: This answer was generated from approved INSTRA AI knowledge. AI formatting was bypassed because the OpenAI call failed.
`;
}

async function generateStandardizedAnswer({
  userQuestion,
  equipmentType,
  packageName,
  approvedKnowledge
}) {
  if (!process.env.OPENAI_API_KEY) {
    return buildFallbackAnswer({
      userQuestion,
      equipmentType,
      packageName,
      approvedKnowledge
    });
  }

  const systemPrompt = `
You are INSTRA AI, an industrial Instrument, Control and Measurement troubleshooting assistant.

Rules:
- You must only use the approved knowledge provided.
- Do not invent standards.
- Do not invent causes.
- Do not invent corrective actions.
- If the approved knowledge is insufficient, clearly say so.
- Keep the answer practical for field engineers and technicians.
- Use the exact answer structure below every time.

Required answer structure:

1. Problem Summary
2. Equipment Involved
3. Most Likely Causes
4. Step-by-Step Checks
5. Corrective Actions
6. Relevant Standards
7. Tacit Knowledge / Field Experience
8. Confidence Level
9. When to Escalate
`;

  const userPrompt = `
User Package:
${packageName}

Selected Equipment:
${equipmentType}

User Question:
${userQuestion}

Approved Knowledge:
${JSON.stringify(approvedKnowledge, null, 2)}
`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ]
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI error:", error.message);

    return buildFallbackAnswer({
      userQuestion,
      equipmentType,
      packageName,
      approvedKnowledge
    });
  }
}

module.exports = {
  generateStandardizedAnswer
};
