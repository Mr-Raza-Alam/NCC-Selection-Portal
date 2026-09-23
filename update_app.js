const fs = require('fs');

let content = fs.readFileSync('frontend/src/App.jsx', 'utf-8');

// Imports to add
const imports = `
import RankRound1Home from './pages/admin/RankRound1Home';
import RankRound1Setup from './pages/admin/RankRound1Setup';
import RankRound1Entry from './pages/admin/RankRound1Entry';
import RankRound2Home from './pages/admin/RankRound2Home';
import RankR2Attendance from './pages/admin/RankR2Attendance';
import RankRound2Entry from './pages/admin/RankRound2Entry';
import RankRound3Home from './pages/admin/RankRound3Home';
import RankRound3Entry from './pages/admin/RankRound3Entry';
import RankRound3Verify from './pages/admin/RankRound3Verify';
import RankMasterTable from './pages/admin/RankMasterTable';
import RankStudentTable from './pages/admin/RankStudentTable';
`;

content = content.replace("import StudentTable from './pages/admin/StudentTable';", "import StudentTable from './pages/admin/StudentTable';" + imports);

// Routes to add
const routes = `
            <Route path="rank/r1" element={<RankRound1Home />} />
            <Route path="rank/r1/setup" element={<RankRound1Setup />} />
            <Route path="rank/r1/entry" element={<RankRound1Entry />} />
            <Route path="rank/r2" element={<RankRound2Home />} />
            <Route path="rank/r2/attendance" element={<RankR2Attendance />} />
            <Route path="rank/r2/entry" element={<RankRound2Entry />} />
            <Route path="rank/r3" element={<RankRound3Home />} />
            <Route path="rank/r3/entry" element={<RankRound3Entry />} />
            <Route path="rank/r3/verify" element={<RankRound3Verify />} />
            <Route path="rank/master" element={<RankMasterTable />} />
            <Route path="rank/students" element={<RankStudentTable />} />
`;

content = content.replace('<Route path="rank/upload" element={<RankUpload />} />', '<Route path="rank/upload" element={<RankUpload />} />' + routes);

fs.writeFileSync('frontend/src/App.jsx', content);
