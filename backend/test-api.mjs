// Comprehensive Automated Test Suite for Brainfy API

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🚀 Starting Brainfy API Test Suite...\n');
  let passCount = 0;
  let failCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passCount++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failCount++;
    }
  }

  try {
    // 1. Health Check
    console.log('--- 1. Health Check ---');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Status is 200');
    assert(healthData.success === true, 'Success is true');
    assert(healthData.data?.status === 'ok', 'API health status is "ok"');

    // 2. User Registration
    console.log('\n--- 2. Auth: Register User ---');
    const uniqueEmail = `tester_${Date.now()}@brainfy.dev`;
    const regPayload = {
      name: 'Alex Developer',
      email: uniqueEmail,
      password: 'Password123!',
    };

    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, 'Register status is 201');
    assert(regData.success === true, 'Register success is true');
    assert(regData.data?.user?.fullName === 'Alex Developer', 'User fullName is populated');
    assert(regData.data?.user?.email === uniqueEmail.toLowerCase(), 'Email matches lowercase');
    assert(Boolean(regData.data?.token), 'JWT token returned in body');
    assert(!regData.data?.user?.password, 'Password hash is NOT exposed');

    const token = regData.data.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // 3. Duplicate Registration Check
    console.log('\n--- 3. Auth: Duplicate Email Rejection ---');
    const dupRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload),
    });
    const dupData = await dupRes.json();
    assert(dupRes.status === 409, 'Duplicate register returns 409 Conflict');
    assert(dupData.success === false, 'Duplicate success is false');

    // 4. Login with Invalid Password
    console.log('\n--- 4. Auth: Invalid Login ---');
    const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: uniqueEmail, password: 'WrongPassword999' }),
    });
    const badLoginData = await badLoginRes.json();
    assert(badLoginRes.status === 401, 'Bad credentials return 401');
    assert(badLoginData.success === false, 'Bad credentials success is false');

    // 5. Login with Correct Password
    console.log('\n--- 5. Auth: Valid Login ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: uniqueEmail, password: 'Password123!' }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'Valid login returns 200');
    assert(loginData.success === true, 'Valid login success is true');
    assert(loginData.data?.user?.fullName === 'Alex Developer', 'Login user returned with fullName');
    assert(Boolean(loginData.data?.token), 'Login returned JWT token');

    // 6. Get Current User (Protected)
    console.log('\n--- 6. Auth: Get Current Profile (/api/auth/me) ---');
    const meRes = await fetch(`${BASE_URL}/auth/me`, { headers: authHeaders });
    const meData = await meRes.json();
    assert(meRes.status === 200, 'Get me returns 200');
    assert(meData.data?.user?.email === uniqueEmail.toLowerCase(), 'Profile matches token owner');

    // 7. Unauthorized Access Check
    console.log('\n--- 7. Auth: Unauthorized Request (No Token) ---');
    const noAuthRes = await fetch(`${BASE_URL}/auth/me`);
    const noAuthData = await noAuthRes.json();
    assert(noAuthRes.status === 401, 'No token returns 401');
    assert(noAuthData.success === false, 'Unauthorized success is false');

    // 8. Collection Management: Create Collection
    console.log('\n--- 8. Collections: Create Collection ---');
    const colRes = await fetch(`${BASE_URL}/collections`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Web Dev & Tools',
        description: 'Frontend and backend engineering links',
        color: '#6366f1',
      }),
    });
    const colData = await colRes.json();
    assert(colRes.status === 201, 'Create collection returns 201');
    assert(colData.data?.collection?.name === 'Web Dev & Tools', 'Collection name correct');
    const colId = colData.data?.collection?._id;

    // 9. Collections: Get All
    console.log('\n--- 9. Collections: Get All Collections ---');
    const colsRes = await fetch(`${BASE_URL}/collections`, { headers: authHeaders });
    const colsData = await colsRes.json();
    assert(colsRes.status === 200, 'Get collections returns 200');
    assert(Array.isArray(colsData.data?.collections), 'Collections is an array');
    assert(colsData.data?.collections?.length >= 1, 'Contains created collection');
    assert(colsData.data?.collections[0]?.linkCount !== undefined, 'Contains linkCount field');

    // 10. Link Management: Create Link (with collection & tags)
    console.log('\n--- 10. Links: Create Link ---');
    const linkRes = await fetch(`${BASE_URL}/links`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'React Documentation',
        url: 'https://react.dev',
        description: 'The library for web and native user interfaces',
        collection: colId,
        tags: ['react', 'javascript', 'frontend'],
      }),
    });
    const linkData = await linkRes.json();
    assert(linkRes.status === 201, 'Create link returns 201');
    assert(linkData.data?.link?.title === 'React Documentation', 'Link title matches');
    assert(linkData.data?.link?.platform === 'Website', 'Platform auto-detected as Website');
    assert(linkData.data?.link?.collection === colId, 'Link collection attached');
    const linkId = linkData.data?.link?._id;

    // 11. Links: Auto-detect YouTube platform
    console.log('\n--- 11. Links: Platform Auto-Detection (YouTube) ---');
    const ytRes = await fetch(`${BASE_URL}/links`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Learn MERN Stack in 2026',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        tags: ['tutorial', 'mern'],
      }),
    });
    const ytData = await ytRes.json();
    assert(ytData.data?.link?.platform === 'YouTube', 'Auto-detected YouTube platform');
    const ytLinkId = ytData.data?.link?._id;

    // 12. Links: Get All Links (with pagination)
    console.log('\n--- 12. Links: Get All Links (Pagination & Envelope) ---');
    const linksRes = await fetch(`${BASE_URL}/links?page=1&limit=10`, { headers: authHeaders });
    const linksData = await linksRes.json();
    assert(linksRes.status === 200, 'Get links returns 200');
    assert(linksData.pagination?.total >= 2, 'Pagination total count >= 2');
    assert(linksData.pagination?.page === 1, 'Pagination page matches');

    // 13. Links: Toggle Favorite
    console.log('\n--- 13. Links: Toggle Favorite ---');
    const favRes = await fetch(`${BASE_URL}/links/${linkId}/favorite`, {
      method: 'PATCH',
      headers: authHeaders,
    });
    const favData = await favRes.json();
    assert(favRes.status === 200, 'Toggle favorite returns 200');
    assert(favData.data?.link?.isFavorite === true, 'isFavorite toggled to true');

    // 14. Links: Get Favorites
    console.log('\n--- 14. Links: Get Favorites ---');
    const favListRes = await fetch(`${BASE_URL}/links/favorites`, { headers: authHeaders });
    const favListData = await favListRes.json();
    assert(favListRes.status === 200, 'Get favorites returns 200');
    assert(favListData.data?.links?.some((l) => l._id === linkId), 'Favorites list contains link');

    // 15. Links: Search and Filter
    console.log('\n--- 15. Links: Filter by Platform ---');
    const ytFilterRes = await fetch(`${BASE_URL}/links?platform=YouTube`, { headers: authHeaders });
    const ytFilterData = await ytFilterRes.json();
    assert(ytFilterData.data?.links?.every((l) => l.platform === 'YouTube'), 'All filtered links are YouTube');

    // 16. Links: Soft Delete (Trash)
    console.log('\n--- 16. Links: Soft Delete to Trash ---');
    const delRes = await fetch(`${BASE_URL}/links/${linkId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(delRes.status === 200, 'Soft delete returns 200');

    // Verify it is in trash
    const trashRes = await fetch(`${BASE_URL}/links/trash`, { headers: authHeaders });
    const trashData = await trashRes.json();
    assert(trashData.data?.links?.some((l) => l._id === linkId), 'Trashed links contains deleted link');

    // 17. Links: Restore from Trash
    console.log('\n--- 17. Links: Restore from Trash ---');
    const restoreRes = await fetch(`${BASE_URL}/links/${linkId}/restore`, {
      method: 'PATCH',
      headers: authHeaders,
    });
    const restoreData = await restoreRes.json();
    assert(restoreRes.status === 200, 'Restore returns 200');
    assert(restoreData.data?.link?.isDeleted === false, 'isDeleted is now false');

    // 18. Links: Permanent Delete
    console.log('\n--- 18. Links: Permanent Delete ---');
    const permRes = await fetch(`${BASE_URL}/links/${ytLinkId}/permanent`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(permRes.status === 200, 'Permanent delete returns 200');

    // 19. User Management: Update Profile
    console.log('\n--- 19. User: Update Profile ---');
    const updateRes = await fetch(`${BASE_URL}/users/me`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ name: 'Alex SuperDev' }),
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200, 'Update profile returns 200');
    assert(updateData.data?.user?.fullName === 'Alex SuperDev', 'fullName updated');

    // 20. User Management: Change Password
    console.log('\n--- 20. User: Change Password ---');
    const pwRes = await fetch(`${BASE_URL}/users/change-password`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
      }),
    });
    assert(pwRes.status === 200, 'Change password returns 200');

    // Verify new password works
    const newLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: uniqueEmail, password: 'NewPassword123!' }),
    });
    assert(newLoginRes.status === 200, 'Login with new password succeeds');

    // 21. Delete Collection (cascade unlink check)
    console.log('\n--- 21. Collections: Delete Collection & Unassign Links ---');
    const delColRes = await fetch(`${BASE_URL}/collections/${colId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(delColRes.status === 200, 'Delete collection returns 200');

    // Verify link still exists but collection is null
    const checkLinkRes = await fetch(`${BASE_URL}/links/${linkId}`, { headers: authHeaders });
    const checkLinkData = await checkLinkRes.json();
    assert(checkLinkData.data?.link?.collection === null, 'Link disassociated from deleted collection safely');

    console.log(`\n========================================`);
    console.log(`TEST SUMMARY: ${passCount} Passed, ${failCount} Failed`);
    console.log(`========================================`);

    if (failCount === 0) {
      console.log('🎉 ALL BACKEND APIS FUNCTIONING PERFECTLY!');
    } else {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('Fatal Test Suite Error:', error);
    process.exitCode = 1;
  }
}

runTests();

