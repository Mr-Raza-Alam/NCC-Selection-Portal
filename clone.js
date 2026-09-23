const fs = require('fs');

let content = fs.readFileSync('backend/controllers/adminController.js', 'utf-8');

// Replace Models
content = content.replace(/Student/g, 'RankCandidate');
content = content.replace(/MasterRecord/g, 'RankMasterRecord');
content = content.replace(/R1Result/g, 'RankR1Result');
content = content.replace(/R2Result/g, 'RankR2Result');
content = content.replace(/R3Result/g, 'RankR3Result');
content = content.replace(/R1Activity/g, 'RankR1Activity');
content = content.replace(/Settings/g, 'RankSettings');
content = content.replace(/Question/g, 'RankQuestion');

// Replace Fields
content = content.replace(/studentId/g, 'candidateId');
content = content.replace(/students/g, 'candidates');

fs.writeFileSync('backend/controllers/rankAdminController.js', content);
