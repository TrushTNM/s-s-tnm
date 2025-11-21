const { initDb, runQuery } = require('./db');

async function byteLevelInspection() {
    await initDb();

    // Get one specific row
    const rows = await runQuery(`
        SELECT id, itemDescription, itemDescription_norm, HEX(itemDescription_norm) as hex_norm
        FROM stock_items 
        WHERE itemDescription LIKE '%185/65%' AND itemDescription LIKE '%R15%'
        LIMIT 1
    `);

    if (rows.length === 0) {
        console.log('No rows found!');
        process.exit(1);
    }

    const row = rows[0];
    console.log('ID:', row.id);
    console.log('\nOriginal itemDescription:');
    console.log(row.itemDescription);
    console.log('\nNormalized (string):');
    console.log(row.itemDescription_norm);
    console.log('\nNormalized (hex):');
    console.log(row.hex_norm);
    console.log('\nNormalized (length):', row.itemDescription_norm.length);
    console.log('\nNormalized (char codes):');
    for (let i = 0; i < Math.min(row.itemDescription_norm.length, 100); i++) {
        const char = row.itemDescription_norm[i];
        const code = char.charCodeAt(0);
        if (code < 32 || code > 126) {
            console.log(`  [${i}] SPECIAL: charCode=${code} (${code.toString(16)})`);
        }
    }

    // Now try the LIKE query directly
    console.log('\n=== Testing LIKE Query ===');
    const testPattern = '%185/65 r15%';
    console.log(`Pattern: "${testPattern}"`);

    const likeResults = await runQuery(`
        SELECT id, itemDescription_norm
        FROM stock_items 
        WHERE itemDescription_norm LIKE ?
        LIMIT 3
    `, [testPattern]);

    console.log(`\nResults: ${likeResults.length}`);
    likeResults.forEach((r, i) => console.log(`  [${i + 1}] ${r.id}: ${r.itemDescription_norm.substring(0, 60)}...`));

    process.exit(0);
}

byteLevelInspection().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
