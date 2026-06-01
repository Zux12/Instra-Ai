const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateStandardizedAnswer({
  userQuestion,
  equipmentType,
  packageName,
  approvedKnowledge
}) {
  if (!process.env.OPENAI_API_KEY) {
    return "OPENAI_API_KEY is missing. Please configure it before testing AI responses.";
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

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
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
}

module.exports = {
  generateStandardizedAnswer
};
