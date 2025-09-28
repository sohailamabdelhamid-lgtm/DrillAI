// Script to create a sample Excel file for testing
// Run with: node create-sample-excel.js

const XLSX = require('xlsx');

// Create sample drilling data
const sampleData = [
  // Headers
  ['Depth', 'SH', 'SS', 'LS', 'DOL', 'ANH', 'Coal', 'Salt', 'DT', 'GR', 'MINFINAL', 'UCS', 'FA', 'RAT', 'ROP'],
  
  // Sample data rows
  [1267, 47.59, 52.41, 0, 0, 0, 0, 0, 62.624, 87.588, 2, 15814.8234, 47.0449, 1, 27.02702703],
  [1274.4, 45.23, 54.77, 0, 0, 0, 0, 0, 65.123, 89.234, 2, 16234.5678, 48.1234, 1.1, 28.456789],
  [1281.8, 43.87, 56.13, 0, 0, 0, 0, 0, 67.456, 91.567, 2, 16567.8901, 49.5678, 1.2, 29.876543],
  [1289.2, 42.15, 57.85, 0, 0, 0, 0, 0, 69.789, 93.789, 2, 16890.1234, 50.9012, 1.3, 31.234567],
  [1296.6, 40.78, 59.22, 0, 0, 0, 0, 0, 72.123, 95.123, 2, 17213.4567, 52.2345, 1.4, 32.567890],
  [1304, 39.45, 60.55, 0, 0, 0, 0, 0, 74.456, 97.456, 2, 17536.7890, 53.5678, 1.5, 33.890123],
  [1311.4, 38.12, 61.88, 0, 0, 0, 0, 0, 76.789, 99.789, 2, 17860.1234, 54.9012, 1.6, 35.123456],
  [1318.8, 36.89, 63.11, 0, 0, 0, 0, 0, 79.123, 102.123, 2, 18183.4567, 56.2345, 1.7, 36.456789],
  [1326.2, 35.67, 64.33, 0, 0, 0, 0, 0, 81.456, 104.456, 2, 18506.7890, 57.5678, 1.8, 37.789012],
  [1333.6, 34.45, 65.55, 0, 0, 0, 0, 0, 83.789, 106.789, 2, 18830.1234, 58.9012, 1.9, 39.012345]
];

// Create workbook and worksheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.aoa_to_sheet(sampleData);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'DrillingData');

// Write file
XLSX.writeFile(workbook, 'sample-drilling-data.xlsx');

console.log('✅ Sample Excel file created: sample-drilling-data.xlsx');
console.log('📊 Contains 10 rows of drilling data with proper headers');
console.log('🧪 You can now upload this file to test the functionality');
