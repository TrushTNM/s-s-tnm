const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to database
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Initialize database schema
const initDb = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Create stock_items table
            db.run(`CREATE TABLE IF NOT EXISTS stock_items (
                id TEXT PRIMARY KEY,
                brand TEXT,
                product TEXT,
                city TEXT,
                quantity INTEGER,
                sellPrice REAL,
                costPrice REAL,
                remarks TEXT,
                itemDescription TEXT,
                size TEXT,
                pattern TEXT,
                segment TEXT,
                rimAh TEXT,
                
                -- Normalized columns for strict search
                id_norm TEXT,
                brand_norm TEXT,
                product_norm TEXT,
                city_norm TEXT,
                itemDescription_norm TEXT,
                size_norm TEXT,
                pattern_norm TEXT,
                segment_norm TEXT,
                rimAh_norm TEXT
            )`, (err) => {
                if (err) {
                    console.error('Error creating table:', err);
                    reject(err);
                } else {
                    // Create indices for performance
                    const indices = [
                        'CREATE INDEX IF NOT EXISTS idx_brand_norm ON stock_items(brand_norm)',
                        'CREATE INDEX IF NOT EXISTS idx_product_norm ON stock_items(product_norm)',
                        'CREATE INDEX IF NOT EXISTS idx_city_norm ON stock_items(city_norm)',
                        'CREATE INDEX IF NOT EXISTS idx_id_norm ON stock_items(id_norm)',
                        'CREATE INDEX IF NOT EXISTS idx_size_norm ON stock_items(size_norm)',
                        'CREATE INDEX IF NOT EXISTS idx_pattern_norm ON stock_items(pattern_norm)',
                        'CREATE INDEX IF NOT EXISTS idx_segment_norm ON stock_items(segment_norm)',
                        'CREATE INDEX IF NOT EXISTS idx_rimAh_norm ON stock_items(rimAh_norm)',
                        'CREATE INDEX IF NOT EXISTS idx_itemDescription_norm ON stock_items(itemDescription_norm)'
                    ];

                    const createIndex = (i) => {
                        if (i >= indices.length) {
                            console.log('Table stock_items and indices ready.');
                            resolve();
                            return;
                        }
                        db.run(indices[i], (err) => {
                            if (err) console.error('Index creation error:', err);
                            createIndex(i + 1);
                        });
                    };
                    createIndex(0);
                }
            });
        });
    });
};

// Helper to run queries with promises
const runQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const runRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

module.exports = { db, initDb, runQuery, runRun };
