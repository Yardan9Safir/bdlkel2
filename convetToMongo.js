const xlsx = require('xlsx');
const { ObjectId } = require('mongodb');

function convertToMongoFormat(fileBuffer) {
  try {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames['Sheet1']; // Access the first sheet
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const mongoData = data.map((row) => {
      return {
        // _id: new ObjectId(),
        time: row['Time'],
        AMB_TEMP: row['AMB_TEMP'],
        station: row['station'],
        CH4: row['CH4'],
        CO: row['CO'],
        NMHC: row['NMHC'],
        NO: row['NO'],
        NO2: row['NO2'],
        NOx: row['NOx'], // Fix the duplicate assignment here
        O3: row['O3'],
      };
    });

    return mongoData;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw new Error('Error reading Excel file');
  }
}

module.exports = convertToMongoFormat;
