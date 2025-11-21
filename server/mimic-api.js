const { initDb, runQuery } = require('./db');
const { normalize } = require('./utils');

async function mimicAPISearch() {
    await initDb();

    // Mimic exactly what the API does
    const searchInput = "185/65 R15";  // What the user types
    const normalizedQuery = normalize(searchInput);
    const likePattern = `%${normalizedQuery}%`;

    console.log('=== Mimicking API Search ===');
    console.log(`User input: "${searchInput}"`);
    console.log(`Normalized: "${normalizedQuery}"`);
    console.log(`LIKE pattern: "${likePattern}"`);

    // Build WHERE clause exactly like the API
    const conditions = [];
    const values = [];

    conditions.push(`itemDescription_norm LIKE ?`);
    values.push(likePattern);

    const where = `WHERE ${conditions.join(' AND ')}`;

    console.log(`\nSQL WHERE: ${where}`);
    console.log(`VALUES:`, values);

    // Count
    const countSQL = `SELECT COUNT(*) as count FROM stock_items ${where}`;
    console.log(`\nCount Query: ${countSQL}`);
    const countResult = await runQuery(countSQL, values);
    console.log(`Count result: ${countResult[0].count}`);

    // Fetch data
    const dataSQL = `SELECT id, itemDescription, itemDescription_norm FROM stock_items ${where} LIMIT 3`;
    console.log(`\nData Query: ${dataSQL}`);
    const data = await runQuery(dataSQL, values);
    console.log(`\nResults: ${data.length}`);
    data.forEach((row, i) => {
        console.log(`\n[${i + 1}] ID: ${row.id}`);
        console.log(`    Original: ${row.itemDescription}`);
        console.log(`    Normalized: ${row.itemDescription_norm.substring(0, 60)}...`);
    });

    process.exit(0);
}

mimicAPISearch().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
