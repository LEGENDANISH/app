import fs from 'fs';
import path from 'path';

// === Function to recursively walk through folders ===
function copyAllJSXFiles(sourceFolder, outputFile = 'merged_jsx_output.txt') {
  // Open the output file (overwrite mode)
  const outputStream = fs.createWriteStream(outputFile, { flags: 'w', encoding: 'utf-8' });

  const walk = (dir) => {
    const files = fs.readdirSync(dir);
    console.log(`\n📁 Checking folder: ${dir}`);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walk(filePath); // Recursively go deeper
      } else if (file.endsWith('.tsx')) {
        try {
          const data = fs.readFileSync(filePath, 'utf-8');
          outputStream.write(`\n\n===== File: ${filePath} =====\n\n`);
          outputStream.write(data);
          console.log(`✅ Copied: ${file}`);
        } catch (err) {
          console.log(`❌ Error reading ${file}: ${err.message}`);
        }
      }
    }
  };

  walk(sourceFolder);
  outputStream.end();
  console.log(`\n✅ All .jsx files merged successfully into '${outputFile}'`);
}

// === Main Execution ===
const sourceFolder = "C:\\Users\\ashis\\OneDrive\\Desktop\\ExpenseWiseLocal\\client\\src";

if (fs.existsSync(sourceFolder)) {
  copyAllJSXFiles(sourceFolder);
} else {
  console.log("❌ The folder path does not exist. Please check and try again.");
}
