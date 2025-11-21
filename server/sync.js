const axios = require('axios');
const Papa = require('papaparse');
const { db, runRun } = require('./db');
const { normalize } = require('./utils');

const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTWGmeQneNnEBcPJA8e6oBeXDLuJ-4Xz0nvLJnLiCls4IHNzSkW5_cgA9YmHpgF2Xz0DWG7prYViY87/pub?gid=200970122&single=true&output=csv';

const syncData = async () => {
    console.log('Starting data sync...');
    try {
        // Fetch CSV
        const response = await axios.get(GOOGLE_SHEET_URL);
        const csvText = response.data;

        // Parse CSV
        const parsed = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
        });

        const items = parsed.data.map((row) => ({
            id: row['SKU'] || `unknown-${Math.random()}`,
            brand: (row['Brand'] || '').trim(),
            product: (row['Product'] || '').trim(),
            city: (row['City'] || '').trim(),
            quantity: parseInt(row['Quantity']?.replace(/,/g, '') || '0', 10),
            sellPrice: parseFloat(row['Rate']?.replace(/,/g, '') || '0'),
            costPrice: parseFloat(row['Value']?.replace(/,/g, '') || '0'),
            remarks: '',
            itemDescription: (row['Item Description'] || '').trim(),
            size: (row['Size'] || '').trim(),
            pattern: (row['Pattern'] || '').trim(),
            segment: (row['Segment'] || '').trim(),
            rimAh: (row['RIM/AH'] || '').trim(),
        })).filter(item => item.id && item.id !== 'unknown');

        if (items.length === 0) {
            console.log('No items found to sync.');
            return;
        }

        // Update DB in a transaction
        await new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                // Clear existing data (Strategy: Full refresh to match Sheet)
                db.run('DELETE FROM stock_items');

                const stmt = db.prepare(`INSERT OR REPLACE INTO stock_items (
                    id, brand, product, city, quantity, sellPrice, costPrice, remarks, itemDescription, size, pattern, segment, rimAh,
                    id_norm, brand_norm, product_norm, city_norm, itemDescription_norm, size_norm, pattern_norm, segment_norm, rimAh_norm
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

                let itemCount = 0;
                items.forEach(item => {
                    const normValues = {
                        id_norm: normalize(item.id),
                        brand_norm: normalize(item.brand),
                        product_norm: normalize(item.product),
                        city_norm: normalize(item.city),
                        itemDescription_norm: normalize(item.itemDescription),
                        size_norm: normalize(item.size),
                        pattern_norm: normalize(item.pattern),
                        segment_norm: normalize(item.segment),
                        rimAh_norm: normalize(item.rimAh)
                    };

                    // Debug first item containing "185/65" and "R15"
                    if (item.itemDescription && item.itemDescription.includes('185/65') && item.itemDescription.includes('R15') && itemCount === 0) {
                        console.log('\n=== DEBUG: First 185/65 R15 item ===');
                        console.log('Original:', item.itemDescription);
                        console.log('Normalized:', normValues.itemDescription_norm);
                        console.log('Length:', normValues.itemDescription_norm.length);
                        itemCount++;
                    }

                    stmt.run(
                        item.id, item.brand, item.product, item.city, item.quantity, item.sellPrice, item.costPrice,
                        item.remarks, item.itemDescription, item.size, item.pattern, item.segment, item.rimAh,
                        // Normalized values
                        normValues.id_norm,
                        normValues.brand_norm,
                        normValues.product_norm,
                        normValues.city_norm,
                        normValues.itemDescription_norm,
                        normValues.size_norm,
                        normValues.pattern_norm,
                        normValues.segment_norm,
                        normValues.rimAh_norm
                    );
                });

                stmt.finalize();

                db.run('COMMIT', (err) => {
                    if (err) {
                        console.error('Transaction commit error:', err);
                        reject(err);
                    } else {
                        console.log(`Synced ${items.length} items to database.`);
                        resolve();
                    }
                });
            });
        });

    } catch (error) {
        console.error('Sync failed:', error);
    }
};

module.exports = { syncData };
