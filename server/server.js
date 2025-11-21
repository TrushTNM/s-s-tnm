const express = require('express');
const cors = require('cors');
const Papa = require('papaparse');
const { initDb, runQuery } = require('./db');
const { syncData } = require('./sync');
const { normalize } = require('./utils');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize DB and Sync
initDb().then(() => {
    syncData();
    // Sync every 5 minutes
    setInterval(syncData, 5 * 60 * 1000);
});

// Helper to build WHERE clause
const buildWhereClause = (params) => {
    const conditions = [];
    const values = [];

    // Search (Contiguous Substring Match on Item Description ONLY)
    if (params.search) {
        // Normalize the ENTIRE query as one contiguous string (no splitting)
        const normalizedQuery = normalize(params.search);
        const likePattern = `%${normalizedQuery}%`;

        console.log(`[SEARCH DEBUG] Original: "${params.search}"`);
        console.log(`[SEARCH DEBUG] Normalized: "${normalizedQuery}"`);
        console.log(`[SEARCH DEBUG] Pattern: "${likePattern}"`);

        // Match if the normalized query appears as a contiguous substring in Item Description ONLY
        conditions.push(`itemDescription_norm LIKE ?`);
        values.push(likePattern);
    }

    // Filters (Exact Match)
    if (params.cities) {
        const cities = Array.isArray(params.cities) ? params.cities : [params.cities];
        if (cities.length > 0) {
            conditions.push(`city IN (${cities.map(() => '?').join(',')})`);
            values.push(...cities);
        }
    }
    if (params.brands) {
        const brands = Array.isArray(params.brands) ? params.brands : [params.brands];
        if (brands.length > 0) {
            conditions.push(`brand IN (${brands.map(() => '?').join(',')})`);
            values.push(...brands);
        }
    }
    if (params.products) {
        const products = Array.isArray(params.products) ? params.products : [params.products];
        if (products.length > 0) {
            conditions.push(`product IN (${products.map(() => '?').join(',')})`);
            values.push(...products);
        }
    }
    if (params.segments) {
        const segments = Array.isArray(params.segments) ? params.segments : [params.segments];
        if (segments.length > 0) {
            conditions.push(`segment IN (${segments.map(() => '?').join(',')})`);
            values.push(...segments);
        }
    }
    if (params.rimAhs) {
        const rimAhs = Array.isArray(params.rimAhs) ? params.rimAhs : [params.rimAhs];
        if (rimAhs.length > 0) {
            conditions.push(`rimAh IN (${rimAhs.map(() => '?').join(',')})`);
            values.push(...rimAhs);
        }
    }

    return {
        where: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
        values
    };
};

// API Endpoints

// Get stock data
app.get('/api/stock', async (req, res) => {
    try {
        const {
            search,
            page = 1,
            pageSize = 20,
            sortBy = 'id',
            sortOrder = 'asc',
            cities,
            brands,
            products,
            segments,
            rimAhs
        } = req.query;

        const params = {
            search,
            cities: cities ? (Array.isArray(cities) ? cities : [cities]) : undefined,
            brands: brands ? (Array.isArray(brands) ? brands : [brands]) : undefined,
            products: products ? (Array.isArray(products) ? products : [products]) : undefined,
            segments: segments ? (Array.isArray(segments) ? segments : [segments]) : undefined,
            rimAhs: rimAhs ? (Array.isArray(rimAhs) ? rimAhs : [rimAhs]) : undefined,
        };

        const { where, values } = buildWhereClause(params);

        console.log(`[SQL] WHERE: ${where}`);
        console.log(`[SQL] VALUES:`, values);

        // Count total
        const countResult = await runQuery(`SELECT COUNT(*)  as count FROM stock_items ${where}`, values);
        const total = countResult[0].count;

        console.log(`[SQL] Total matches: ${total}`);

        // Fetch data
        const limit = parseInt(pageSize);
        const offset = (parseInt(page) - 1) * limit;

        // Safe sort column check to prevent SQL injection
        const allowedSortCols = ['id', 'brand', 'product', 'city', 'quantity', 'sellPrice', 'costPrice', 'itemDescription', 'size', 'pattern', 'segment', 'rimAh'];
        const safeSortBy = allowedSortCols.includes(sortBy) ? sortBy : 'id';
        const safeSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

        const sql = `SELECT * FROM stock_items ${where} ORDER BY ${safeSortBy} ${safeSortOrder} LIMIT ? OFFSET ?`;
        const data = await runQuery(sql, [...values, limit, offset]);

        res.json({
            data,
            total,
            page: parseInt(page),
            pageSize: parseInt(pageSize)
        });
    } catch (error) {
        console.error('Error in /api/stock:', error);
        res.status(500).json({ error: 'Failed to fetch stock data' });
    }
});

// Get filter options
app.get('/api/filters', async (req, res) => {
    try {
        const { cities, brands, products, segments, rimAhs } = req.query;

        const parseArray = (val) => val ? (Array.isArray(val) ? val : [val]) : undefined;
        const currentFilters = {
            cities: parseArray(cities),
            brands: parseArray(brands),
            products: parseArray(products),
            segments: parseArray(segments),
            rimAhs: parseArray(rimAhs)
        };

        // Helper to get distinct values for a field, applying other filters
        const getOptions = async (field, filters) => {
            const { where, values } = buildWhereClause(filters);
            const sql = `SELECT DISTINCT ${field} FROM stock_items ${where} ORDER BY ${field}`;
            const rows = await runQuery(sql, values);
            return rows.map(r => r[field]).filter(Boolean);
        };

        const [cityOpts, brandOpts, productOpts, segmentOpts, rimAhOpts] = await Promise.all([
            getOptions('city', { ...currentFilters, cities: undefined }),
            getOptions('brand', { ...currentFilters, brands: undefined }),
            getOptions('product', { ...currentFilters, products: undefined }),
            getOptions('segment', { ...currentFilters, segments: undefined }),
            getOptions('rimAh', { ...currentFilters, rimAhs: undefined }),
        ]);

        res.json({
            cities: cityOpts,
            brands: brandOpts,
            products: productOpts,
            segments: segmentOpts,
            rimAhs: rimAhOpts,
        });
    } catch (error) {
        console.error('Error in /api/filters:', error);
        res.status(500).json({ error: 'Failed to fetch filter options' });
    }
});

// Export data
app.get('/api/export', async (req, res) => {
    try {
        const { ids } = req.query;

        let sql = 'SELECT * FROM stock_items';
        let params = [];

        if (ids) {
            const idList = Array.isArray(ids) ? ids : [ids];
            sql += ` WHERE ID IN (${idList.map(() => '?').join(',')})`;
            params = idList;
        }

        const data = await runQuery(sql, params);

        if (data.length === 0) {
            return res.send('');
        }

        const csv = Papa.unparse(data);
        res.header('Content-Type', 'text/csv');
        res.attachment('stock-export.csv');
        res.send(csv);
    } catch (error) {
        console.error('Error in /api/export:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
