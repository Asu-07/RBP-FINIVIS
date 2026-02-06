// import fetch from 'node-fetch'; // Built-in fetch in Node 18+
import fs from 'fs';

const BASE_URL = 'https://dolphin.asego.in:8080/ext/b2b/v1';
const PARTNER_ID = '7a954713-2468-4ab2-9b28-34883b10f9bf'; // Default from code

const LOG_FILE = 'api_debug_log.txt';
function log(msg) {
    console.log(msg);
    fs.appendFileSync(LOG_FILE, msg + '\n');
}

fs.writeFileSync(LOG_FILE, ''); // Clear file

async function testApi() {
    log('--- Testing Categories ---');
    try {
        const catRes = await fetch(`${BASE_URL}/category`);
        if (!catRes.ok) {
            log(`Categories Error: ${catRes.status} ${await catRes.text()}`);
        } else {
            const categories = await catRes.json();
            log(`Categories found: ${categories.length}`);
            categories.forEach(c => log(`- ${c.name} (ID: ${c.id})`));

            if (categories.length > 0) {
                // Try fetching plans for the first category
                const testCat = categories[0];
                log(`\n--- Testing Plans for Category: ${testCat.name} (ID: ${testCat.id}) ---`);
                await fetchPlans(testCat.id);

                // If there's a specific "Asia" category, try that too
                const asiaCat = categories.find(c => c.name.toLowerCase().includes('asia'));
                if (asiaCat && asiaCat.id !== testCat.id) {
                    log(`\n--- Testing Plans for Category: ${asiaCat.name} (ID: ${asiaCat.id}) ---`);
                    await fetchPlans(asiaCat.id);
                }
            }
        }
    } catch (err) {
        log(`Categories Exception: ${err.stack}`);
    }
}


async function fetchPlans(categoryId) {
    // Test case 1: Standard (as per code)
    await runFetch(categoryId, '10', '30', 'Standard');

    // Test case 2: Comma separated age
    const params2 = new URLSearchParams();
    params2.append('duration', '10');
    params2.append('age', '30');
    params2.append('category', categoryId);
    // Note: URLSearchParams encodes comma, so we might need to manually construct if API wants raw comma
    // But let's stick to standard first.

    // Test case 3: Short duration
    await runFetch(categoryId, '5', '30', 'Short Duration (5)');

    // Test case 4: Long duration
    await runFetch(categoryId, '30', '30', 'Long Duration (30)');

    // Test case 5: Different Age
    await runFetch(categoryId, '10', '25', 'Age 25');
}

async function runFetch(categoryId, duration, age, label) {
    const params = new URLSearchParams();
    params.append('duration', duration);
    params.append('age', age);
    params.append('category', categoryId);

    const url = `${BASE_URL}/plan/${PARTNER_ID}?${params.toString()}`;
    log(`[${label}] Fetching: ${url}`);

    try {
        const res = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!res.ok) {
            log(`[${label}] Error: ${res.status}`);
        } else {
            const plans = await res.json();
            log(`[${label}] Plans found: ${plans.length}`);
            if (plans.length > 0) {
                log(`[${label}] First Plan: ${JSON.stringify(plans[0]).substring(0, 100)}...`);
            }
        }
    } catch (err) {
        log(`[${label}] Exception: ${err.message}`);
    }
}

testApi();
