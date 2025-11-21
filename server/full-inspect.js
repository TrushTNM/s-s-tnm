const { initDb, runQuery } = require('./db');
const { normalize } = require('./utils');

async function fullInspection() {
    await initDb();

    // Test 1: What does normalize produce for our search term?
    const searchTerm = "185/65 R15";
    const normalized = normalize(searchTerm);
    console.log('\n=== TEST 1: Normalization ===');
    console.log(`Search term: "${searchTerm}"`);
    console.log(`Normalized:  "${normalized}"`);
    console.log(`Pattern:     "%${normalized}%"`);

    // Test 2: Find all rows containing "185/65" AND "R15" in original Item Description
    console.log('\n=== TEST 2: Original Data ===');
    const rows = await runQuery(`
        SELECT id, itemDescription 
        FROM stock_items 
        WHERE itemDescription LIKE '%185/65%' AND itemDescription LIKE '%R15%'
        LIMIT 3
    `);
    console.log(`Found ${rows.length} rows:`);
    rows.forEach((r, i) => {
        console.log(`  [${i + 1}] ${r.id}: ${r.itemDescription}`);
    });

    // Test 3: Check their normalized values
    console.log('\n=== TEST 3: Normalized Column Data ===');
    if (rows.length > 0) {
        const firstId = rows[0].id;
        const detail = await runQuery(`
            SELECT id, itemDescription, itemDescription_norm, LENGTH(itemDescription_norm) as norm_length
            FROM stock_items 
            WHERE id = ?
        `, [firstId]);

        console.log(`ID: ${detail[0].id}`);
        console.log(`Original: "${detail[0].itemDescription}"`);
        console.log(`Normalized: "${detail[0].itemDescription_norm}"`);
        console.log(`Length: ${detail[0].norm_length}`);

        // What SHOULD it be?
        const expected = normalize(detail[0].itemDescription);
        console.log(`\nExpected normalize output: "${expected}"`);
        console.log(`Expected length: ${expected.length}`);
        console.log(`Match: ${detail[0].itemDescription_norm === expected ? 'YES' : 'NO'}`);
    }

    // Test 4: Try the actual search
    console.log('\n=== TEST 4: Actual Search Query ===');
    const searchPattern = `%${normalized}%`;
    const results = await runQuery(`
        SELECT id, itemDescription, itemDescription_norm
        FROM stock_items 
        WHERE itemDescription_norm LIKE ?
        LIMIT 3
    `, [searchPattern]);
    console.log(`Query: itemDescription_norm LIKE "${searchPattern}"`);
    console.log(`Results: ${results.length}`);
    results.forEach((r, i) => {
        console.log(`  [${i + 1}] ${r.id}`);
        console.log(`      Original: ${r.itemDescription}`);
        console.log(`      Normalized: ${r.itemDescription_norm}`);
    });

    process.exit(0);
}

fullInspection().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
