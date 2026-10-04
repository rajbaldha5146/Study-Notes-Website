export const NOTE_TEMPLATES = [
  {
    id: "blank",
    name: "Blank Note",
    icon: "📝",
    content: "",
  },
  {
    id: "lecture",
    name: "Lecture / Topic Notes",
    icon: "📚",
    content: `# Topic Name

## 🎯 Key Objectives
- Objective 1
- Objective 2

## 💡 Key Concepts
1. **Concept 1**: Brief description
2. **Concept 2**: Brief description

## 📝 Detailed Notes
Write your detailed explanations here...

## 💻 Code Example
\`\`\`javascript
// Example code snippet
const demo = () => {
  console.log("Hello NoteMaster!");
};
\`\`\`

## 📌 Summary & Takeaways
- Main takeaway 1
- Main takeaway 2
`,
  },
  {
    id: "cheatsheet",
    name: "Cheat Sheet",
    icon: "⚡",
    content: `# Technology / Library Cheat Sheet

## 🚀 Quick Reference

| Command / Method | Description | Example |
| --- | --- | --- |
| \`methodOne()\` | Does action A | \`methodOne("param")\` |
| \`methodTwo()\` | Does action B | \`methodTwo(123)\` |

## 💡 Frequently Used Snippets

\`\`\`javascript
// Snippet 1
import React from 'react';

// Snippet 2
export default function Component() {
  return <div>Hello</div>;
}
\`\`\`
`,
  },
  {
    id: "tutorial",
    name: "Code Tutorial",
    icon: "💻",
    content: `# Tutorial: [Title Here]

## 📋 Prerequisites
- Node.js installed
- Basic knowledge of JavaScript

## 🛠️ Step-by-step Guide

### Step 1: Setup
Explain setup steps...

\`\`\`bash
npm init -y
\`\`\`

### Step 2: Implementation
Explain code logic...

\`\`\`javascript
function calculateSum(a, b) {
  return a + b;
}
\`\`\`

## 🎯 Conclusion
Wrap up what was built and next steps.
`,
  },
];
