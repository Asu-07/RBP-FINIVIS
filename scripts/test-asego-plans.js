// Quick ASEGO plan-availability scanner
// Run with: npm run test:insurance-plans
//
// It will:
// 1. Fetch all categories from /ext/b2b/v1/category
// 2. For a small grid of durations and ages, call
//    /ext/b2b/v1/plan/{partnerId}?duration=..&age=..&category=..
// 3. Log which combinations actually return at least one plan.

const BASE_URL = (process.env.VITE_INSURANCE_BASE_URL || 'https://dolphin.asego.in:8080').replace(/\/api$/, '');
const PARTNER_ID = process.env.VITE_INSURANCE_PARTNER_ID || '7a954713-2468-4ab2-9b28-34883b10f9bf';

// Adjust these to broaden or narrow the scan
const DURATIONS = [1, 3, 5, 7, 10, 15, 30];
const AGES = [18, 25, 30, 40, 50, 60];

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed ${res.status}: ${text}`);
  }
  return res.json();
}

async function main() {
  console.log('ASEGO base URL:', BASE_URL);
  console.log('Partner ID:', PARTNER_ID);

  const categoryUrl = `${BASE_URL}/ext/b2b/v1/category`;
  console.log('Fetching categories from', categoryUrl);

  const categories = await fetchJson(categoryUrl);
  if (!Array.isArray(categories) || categories.length === 0) {
    console.log('No categories returned from ASEGO; cannot continue.');
    return;
  }

  console.log(`Found ${categories.length} categories.`);

  const results = [];

  for (const cat of categories) {
    const categoryId = cat.id || cat.categoryId || cat.code;
    console.log('\n=== Category ===');
    console.log('ID:', categoryId, 'Name:', cat.name || cat.description || '');

    for (const duration of DURATIONS) {
      for (const age of AGES) {
        const params = new URLSearchParams();
        params.append('duration', String(duration));
        params.append('age', String(age));
        params.append('category', String(categoryId));

        const url = `${BASE_URL}/ext/b2b/v1/plan/${PARTNER_ID}?${params.toString()}`;

        try {
          const data = await fetchJson(url);
          const count = Array.isArray(data) ? data.reduce((sum, root) => sum + (root.plans?.length || 0), 0) : 0;

          if (count > 0) {
            console.log(`  ✅ duration=${duration}, age=${age} → ${count} plans`);
            results.push({ categoryId, categoryName: cat.name, duration, age, plans: count });
          } else {
            console.log(`  ▫ duration=${duration}, age=${age} → 0 plans`);
          }
        } catch (err) {
          console.log(`  ❌ duration=${duration}, age=${age} → error: ${(err && err.message) || err}`);
        }
      }
    }
  }

  console.log('\n==== SUMMARY OF COMBINATIONS WITH PLANS ====');
  if (results.length === 0) {
    console.log('No combinations returned any plans. Check ASEGO configuration or credentials.');
  } else {
    for (const r of results) {
      console.log(
        `Category ${r.categoryName || ''} (${r.categoryId}) | duration=${r.duration} | age=${r.age} → ${r.plans} plans`
      );
    }
  }
}

main().catch((err) => {
  console.error('Fatal error while scanning ASEGO plans:', err);
  process.exit(1);
});

