const fs = require('fs');
const path = require('path');

const dir = 'frontend/src/pages/admin';
const filesToClone = [
  'Round1Home.jsx', 'Round1Setup.jsx', 'Round1Entry.jsx',
  'Round2Home.jsx', 'R2Attendance.jsx', 'Round2Entry.jsx',
  'Round3Home.jsx', 'Round3Entry.jsx', 'Round3Verify.jsx',
  'MasterTable.jsx', 'StudentTable.jsx'
];

filesToClone.forEach(file => {
  const srcPath = path.join(dir, file);
  const destPath = path.join(dir, `Rank${file}`);
  
  if (fs.existsSync(srcPath)) {
    let content = fs.readFileSync(srcPath, 'utf-8');
    
    // Replace API endpoint
    content = content.replace(/\/api\/admin/g, '/api/rank-admin');
    
    // Replace component name exports
    const baseName = file.replace('.jsx', '');
    content = content.replace(`const ${baseName} =`, `const Rank${baseName} =`);
    content = content.replace(`export default ${baseName};`, `export default Rank${baseName};`);
    
    // For specific UI tweaks like Buddy No vs Chest No, we can do it globally or in the script
    content = content.replace(/Chest No/gi, 'Buddy No');
    content = content.replace(/code/g, 'buddyNo');
    content = content.replace(/student\.code/g, 'student.buddyNo');
    content = content.replace(/Student Record/gi, 'Cadet Record');
    content = content.replace(/StudentTable/g, 'RankStudentTable');
    content = content.replace(/admissionNo/g, 'regimentalNo');
    content = content.replace(/Admission No/gi, 'Regimental No');

    // Remove document verification logic from Round 3 Verify for Rank
    if (file === 'Round3Verify.jsx') {
      content = content.replace(/HS Marks/g, 'Removed HS');
      content = content.replace(/NCC A-Cert/g, 'Removed A-Cert');
    }
    
    fs.writeFileSync(destPath, content);
    console.log(`Cloned and patched ${file} -> Rank${file}`);
  }
});
