const fs = require('fs');
const path = require('path');

const filesToFix = [
  'manager/pages/LeavesApprovals.tsx',
  'manager/components/Navbar.tsx',
  'manager/api/services.ts',
  'hr/pages/LeaveCenter.tsx',
  'hr/components/Navbar.tsx',
  'hr/api/services.ts',
  'features/leaves/LeavesPage.tsx',
  'admin/pages/LeaveManagement.tsx',
  'admin/components/Navbar.tsx',
  'admin/api/services.ts'
];

for (const relPath of filesToFix) {
  const p = path.join('c:/Users/jeevi/OneDrive/Desktop/NexusHR/nexushr-frontend/src', relPath);
  if (!fs.existsSync(p)) continue;
  let content = fs.readFileSync(p, 'utf8');
  
  // For Leaves, replace strict equality with startsWith or includes
  content = content.replace(/status === 'PENDING'/g, "status.includes('PENDING')");
  
  // For mock data assignments in services.ts
  if (p.includes('services.ts')) {
    // We only want to replace status: 'PENDING' inside leave arrays, but a simple replace might hit goals too.
    // Let's replace `status: 'PENDING'` in LeaveRequest seeds. 
    // They usually look like: `type: 'ANNUAL', status: 'PENDING'` or similar.
    // Let's just do a targeted regex for the seed data we know about.
    content = content.replace(/status: 'PENDING', workflowStage/g, "status: 'PENDING_MANAGER_APPROVAL', workflowStage");
    content = content.replace(/type: '(ANNUAL|SICK|UNPAID)', status: 'PENDING'/g, "type: '$1', status: 'PENDING_MANAGER_APPROVAL'");
  }

  // Admin LeaveManagement.tsx uses req.status === 'PENDING'
  if (p.includes('LeaveManagement.tsx')) {
    content = content.replace(/req\.status === 'PENDING'/g, "req.status.includes('PENDING')");
  }
  
  // LeavesPage.tsx uses req.status === 'PENDING'
  if (p.includes('LeavesPage.tsx')) {
    content = content.replace(/req\.status === 'PENDING'/g, "req.status.includes('PENDING')");
  }

  fs.writeFileSync(p, content);
}
