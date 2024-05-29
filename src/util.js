const fs = require('fs');

// Progress Logger
let lastLogged = 0;
const printProgress = (progress) => {
  const currentTime = new Date().getTime();
  if (currentTime - lastLogged < 500) {
    return;
  }
  console.log(progress);
  lastLogged = currentTime;
};

// File System Utilities
function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  } 
}
function ensureFile(file) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({}, null, 2));
  }
}
function readJsonFile(file) {
  const data = fs.readFileSync(file, "utf8");
  return JSON.parse(data);
}
function writeJsonFile(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

exports.printProgress = printProgress;
exports.fsUtil = { ensureDirectory, ensureFile, readJsonFile, writeJsonFile };
