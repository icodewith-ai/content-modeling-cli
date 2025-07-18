//======================================
// file: validate-field-registry.js
// version: 1.3
// last updated: 05-28-2025
//======================================

const fs = require("fs");
const path = require("path");

// Use a known file in @fields to safely resolve the fieldsDir
const fieldsDir = path.dirname(require.resolve("@fields/createText.js"));
const registryPath = path.join(fieldsDir, "field-registry.json");

function validateFieldRegistry() {
  let hasErrors = false;

  if (!fs.existsSync(registryPath)) {
    console.log(registryPath);
    console.log(fieldsDir);
    console.error("❌ field-registry.json not found.");
    process.exit(1);
  }

  const registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
  const seenTypes = new Set();

  registry.forEach(({ type, function: functionName, file }, index) => {
    const context = `Entry ${index + 1} (${type})`;

    // Check required keys
    if (!type || !functionName || !file) {
      console.error(`❌ ${context}: Missing required field(s). Each entry must include 'type', 'function', and 'file'.`);
      hasErrors = true;
      return;
    }

    // Check for duplicate types
    if (seenTypes.has(type)) {
      console.error(`❌ ${context}: Duplicate type "${type}".`);
      hasErrors = true;
    } else {
      seenTypes.add(type);
    }

    // Check file exists
    const filePath = path.join(fieldsDir, file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ ${context}: File not found: ${file}`);
      hasErrors = true;
      return;
    }

    // Check function exists in module
    const mod = require(filePath);
    if (typeof mod[functionName] !== "function") {
      console.error(`❌ ${context}: Function "${functionName}" not found in file: ${file}`);
      hasErrors = true;
    }
  });

  if (hasErrors) {
    console.error("\n❌ field-registry.json validation failed.\n");
    process.exit(1);
  } else {
    console.log("✅ field-registry.json is valid.\n");
  }
}

// 🧪 Support direct CLI usage
if (require.main === module) {
  validateFieldRegistry();
}

// 🧩 Export for dev.js CLI
module.exports = {
  validateFieldRegistry,
};