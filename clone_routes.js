const fs = require('fs');

let content = fs.readFileSync('backend/routes/adminRoutes.js', 'utf-8');

// Replace Controller require
content = content.replace(/..\/controllers\/adminController/g, '../controllers/rankAdminController');

// I also need to keep the upload-cadets route I already wrote, so it's better to just manually append the routes from adminRoutes.js to rankAdminRoutes.js. Let's just do that programmatically.

const adminRoutesContent = fs.readFileSync('backend/routes/adminRoutes.js', 'utf-8');
const rankAdminRoutesContent = fs.readFileSync('backend/routes/rankAdminRoutes.js', 'utf-8');

// Extract all the router.get, router.post, router.put from adminRoutes (except the first few lines of imports)
const lines = adminRoutesContent.split('\n');
const routeLines = lines.filter(line => line.startsWith('router.') || line.startsWith('// ='));

let newContent = rankAdminRoutesContent.replace('module.exports = router;', '');

newContent += `\n// --- Cloned Routes from Admin --- \n`;
const { 
  setupR1, getR1Table, enterR1Score, finalizeR1, setR1Cutoff,
  startR2, markR2Attendance, enterR2Score, finalizeR2, getR2Table, setR2Cutoff,
  startR3, markR3Attendance, enterR3Score, finalizeR3, getR3Table,
  getMasterTable, updateMasterStatus, publishResults, getDashboardStats
} = require('./backend/controllers/rankAdminController'); // Just text for require

newContent = `
const { 
  setupR1, getR1Table, enterR1Score, finalizeR1, setR1Cutoff,
  startR2, markR2Attendance, enterR2Score, finalizeR2, getR2Table, setR2Cutoff,
  startR3, markR3Attendance, enterR3Score, finalizeR3, getR3Table,
  getMasterTable, updateMasterStatus, publishResults, getDashboardStats,
  getStudentsList
} = require('../controllers/rankAdminController');
` + newContent;

newContent += routeLines.join('\n');
newContent += `\nmodule.exports = router;\n`;

fs.writeFileSync('backend/routes/rankAdminRoutes.js', newContent);
