/**
 * Canonicalization Contract v2
 * 
 * Rules:
 * 1. Lowercase everything.
 * 2. Trim whitespace at both ends.
 * 3. Collapse repeated spaces into a single space.
 * 4. Preserve meaningful separators (/, -, .) exactly as-is.
 * 5. Remove non-meaningful characters (commas, underscores).
 * 6. Do not drop the letter R (significant in tyre/rim notation).
 */
const normalize = (str) => {
    if (!str) return '';
    return String(str)
        .toLowerCase()
        .replace(/[,_]/g, '')       // Remove non-meaningful separators
        .replace(/\s+/g, ' ')       // Collapse spaces
        .trim();
};

module.exports = { normalize };
