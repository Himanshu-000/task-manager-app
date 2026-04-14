const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "Task-Manager-App-Summary.pdf");

const page = { width: 595, height: 842, margin: 42 };
let y = page.height - page.margin;
const commands = [];

function escapePdfText(text) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function pushText(text, x, yPos, size = 11, font = "F1") {
  commands.push("BT");
  commands.push(`/${font} ${size} Tf`);
  commands.push(`${x} ${yPos} Td`);
  commands.push(`(${escapePdfText(text)}) Tj`);
  commands.push("ET");
}

function wrapText(text, maxWidth, size) {
  const avgCharWidth = size * 0.53;
  const maxChars = Math.max(12, Math.floor(maxWidth / avgCharWidth));
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= maxChars) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function addWrappedText(text, opts = {}) {
  const {
    x = page.margin,
    size = 10.5,
    font = "F1",
    maxWidth = page.width - page.margin * 2,
    gapAfter = 6,
    lineHeight = size + 3
  } = opts;

  const lines = wrapText(text, maxWidth, size);
  for (const line of lines) {
    pushText(line, x, y, size, font);
    y -= lineHeight;
  }
  y -= gapAfter;
}

function addBullet(text, indent = 12) {
  const bulletX = page.margin + indent;
  const textX = bulletX + 12;
  const maxWidth = page.width - textX - page.margin;
  const lines = wrapText(text, maxWidth, 10.2);

  pushText("-", bulletX, y, 11, "F1");
  if (lines.length) {
    pushText(lines[0], textX, y, 10.2, "F1");
    y -= 13;
  }

  for (let i = 1; i < lines.length; i++) {
    pushText(lines[i], textX, y, 10.2, "F1");
    y -= 13;
  }

  y -= 3;
}

function addSection(title) {
  pushText(title, page.margin, y, 12.5, "F2");
  y -= 18;
}

pushText("Task Manager App Summary", page.margin, y, 18, "F2");
y -= 26;

addSection("What It Is");
addWrappedText(
  "A browser-based single-page task manager for creating and tracking personal to-do items. It runs entirely on the client with plain HTML, CSS, and JavaScript, and stores task data in localStorage."
);

addSection("Who It's For");
addWrappedText(
  "Primary persona: an individual user who wants a lightweight personal task list in a browser without sign-in, backend setup, or external services."
);

addSection("What It Does");
[
  "Adds tasks from a text input using the Add button.",
  "Supports pressing Enter to submit a new task.",
  "Shows tasks in a dynamic list in the page.",
  "Marks tasks complete by clicking the task text.",
  "Edits task text through a browser prompt.",
  "Deletes individual tasks from the list.",
  "Filters tasks by All, Completed, and Pending, and can clear all tasks."
].forEach(addBullet);

addSection("How It Works");
[
  "UI shell: index.html defines the page container, task input, filter buttons, task list, and Clear All control.",
  "Presentation: style.css applies the centered card layout, gradients, buttons, list item styling, and completed-task visual state.",
  "Logic/state: script.js keeps a tasks array and currentFilter value in browser memory, updates the DOM via renderTasks(), and persists tasks with localStorage.",
  "Data flow: user action -> JavaScript handler -> tasks state/localStorage update -> list rerender in the DOM.",
  "Backend/API/build tooling: Not found in repo."
].forEach(addBullet);

addSection("How To Run");
[
  "Open index.html in any modern web browser.",
  "Type a task and use Add or press Enter to create it.",
  "No install, package manager, or setup script was found in repo."
].forEach(addBullet);

const stream = commands.join("\n");
const objects = [];

function addObject(content) {
  objects.push(content);
}

addObject("<< /Type /Catalog /Pages 2 0 R >>");
addObject("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
addObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.width} ${page.height}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`);
addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
addObject(`<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`);

let pdf = "%PDF-1.4\n";
const offsets = [0];

for (let i = 0; i < objects.length; i++) {
  offsets.push(Buffer.byteLength(pdf, "utf8"));
  pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
}

const xrefPos = Buffer.byteLength(pdf, "utf8");
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += "0000000000 65535 f \n";

for (let i = 1; i < offsets.length; i++) {
  pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
}

pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

fs.writeFileSync(outputPath, pdf, "utf8");
console.log(outputPath);
