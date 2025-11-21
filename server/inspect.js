const { initDb, runQuery } = require('./db');

async function inspect() {
    await initDb();

    console.log('\n=== INSPECTION 1: Find rows with "185/65" and "R15" in Item Description ===');
    const rows1 = await runQuery(`
        SELECT itemDescription, itemDescription_norm 
        FROM stock_items 
        WHERE itemDescription LIKE '%185/65%R15%' 
        LIMIT 5
    `);
    console.log('Count:', rows1.length);
    rows1.forEach((r, i) => {
        console.log(`\n[${i + 1}] Original: ${r.itemDescription}`);
        console.log(`    Normalized: ${r.itemDescription_norm}`);
    });

    console.log('\n=== INSPECTION 2: Total count ===');
    const count = await runQuery(`
        SELECT COUNT(*) as total 
        FROM stock_items 
        WHERE itemDescription LIKE '%185/65%R15%'
    `);
    console.log('Total rows containing "185/65" and "R15":', count[0].total);

    console.log('\n=== INSPECTION 3: Test normalized search ===');
    const { normalize } = require('./utils');
    const testQuery = "185/65 R15";
    const normalizedQuery = normalize(testQuery);
    console.log(`Query: "${testQuery}"`);
    console.log(`Normalized: "${normalizedQuery}"`);

    const rows3 = await runQuery(`
        SELECT itemDescription, itemDescription_norm 
        FROM stock_items 
        WHERE itemDescription_norm LIKE ? 
        LIMIT 5
    `, [`%${normalizedQuery}%`]);
    console.log(`Matches: ${rows3.length}`);
    rows3.forEach((r, i) => {
        console.log(`\n[${i + 1}] ${r.itemDescription}`);
        console.log(`    norm: ${r.itemDescription_norm}`);
    });

    process.exit(0);
}

inspect().catch(console.error);
