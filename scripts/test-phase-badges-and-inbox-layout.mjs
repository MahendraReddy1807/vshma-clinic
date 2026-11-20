import fs from 'fs';
import path from 'path';

function runAssertions() {
  console.log('🧪 Starting Phase Badges & Inbox Layout Verification Suite...\n');

  // Test 1: Layout navItems have no Phase or CRM badges
  const layoutContent = fs.readFileSync(path.join(process.cwd(), 'src/app/admin/layout.tsx'), 'utf-8');
  if (layoutContent.includes("'Phase 2'") || layoutContent.includes("'Phase 4'") || layoutContent.includes("'Phase 5'") || layoutContent.includes("'CRM'")) {
    throw new Error('Test 1 Failed: Phase or CRM badges still present in AdminLayout navItems');
  }
  console.log('  ✅ Passed: Test 1 — Admin layout navigation has no Phase or CRM badges');

  // Test 2: Patients page has no "Phase 1 Active"
  const patientsContent = fs.readFileSync(path.join(process.cwd(), 'src/app/admin/patients/page.tsx'), 'utf-8');
  if (patientsContent.includes('Phase 1 Active') || patientsContent.includes('Phase 1')) {
    throw new Error('Test 2 Failed: "Phase 1 Active" still present in Patients page');
  }
  console.log('  ✅ Passed: Test 2 — Patient CRM directory has no "Phase 1 Active" badge');

  // Test 3: Inbox page eliminated scrollIntoView bug
  const inboxContent = fs.readFileSync(path.join(process.cwd(), 'src/app/admin/inbox/page.tsx'), 'utf-8');
  if (inboxContent.includes('scrollIntoView')) {
    throw new Error('Test 3 Failed: scrollIntoView still present in Inbox page');
  }
  if (!inboxContent.includes('messagesContainerRef') || !inboxContent.includes('scrollToBottom')) {
    throw new Error('Test 3 Failed: messagesContainerRef or scrollToBottom missing in Inbox page');
  }
  console.log('  ✅ Passed: Test 3 — Inbox page scrollIntoView() bug replaced with direct container scrolling');

  // Test 4: Inbox layout panels have min-h-0 and h-full
  if (!inboxContent.includes('h-[calc(100vh-14rem)]') || !inboxContent.includes('min-h-0 overflow-hidden')) {
    throw new Error('Test 4 Failed: Grid container or panel min-h-0 / height classes missing');
  }
  console.log('  ✅ Passed: Test 4 — 3-Panel grid layout has fixed height and min-h-0 flex-overflow isolation');

  // Test 5: Meta references removed from inbox compliance banner
  if (inboxContent.includes('Meta Compliant')) {
    throw new Error('Test 5 Failed: "Meta Compliant" still present in Inbox banner');
  }
  console.log('  ✅ Passed: Test 5 — Replaced Meta references with WhatsApp Active');

  console.log('\n========================================');
  console.log('Total: 5/5 Tests Passed.');
  console.log('========================================\n');
}

runAssertions();
