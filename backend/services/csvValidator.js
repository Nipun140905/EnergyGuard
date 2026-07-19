const validateCSVHeaders = (fileBuffer, requiredColumns) => {
    const content = fileBuffer.toString('utf8');
    const firstLine = content.split('\n')[0];
    const headers = firstLine.split(',').map((h) => h.trim().toLowerCase());

    const missing = requiredColumns.filter((col) => !headers.includes(col));

    if (missing.length > 0) {
        throw new Error(`Missing required columns: ${missing.join(', ')}`);
    }

    return true;
};

const validateEnergyCSV = (fileBuffer) => {
    return validateCSVHeaders(fileBuffer, ['timestamp', 'value']);
};

module.exports = { validateEnergyCSV };