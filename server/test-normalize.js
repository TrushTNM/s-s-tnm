const { normalize } = require('./utils');

// Test the normalize function itself
const testCases = [
    "PCR_TYRE_JK_185/65 R15_TAXIMAX 88H_88H_TUBELESS TYRE",
    "185/65 R15",
    "EXIDE",
    "apollo",
];

console.log('=== NORMALIZE FUNCTION TEST ===\n');
testCases.forEach(test => {
    const result = normalize(test);
    console.log(`Input:  "${test}"`);
    console.log(`Output: "${result}"`);
    console.log(`Length: ${result.length}`);
    console.log('');
});
