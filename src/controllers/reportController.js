const mongoose = require('mongoose');
const BoardData = require('../models/BoardData');
const fastCsv = require('fast-csv');
const pdfMake = require('pdfmake');
const fs = require('fs');
const path = require('path');

const ReportController = {
    generateReport: async (req, res) => {
        try {
            const { unit_ID } = req.params;
            const { start_date, end_date, format } = req.query;

            if (!unit_ID) {
                return res.status(400).json({ error: 'unit_ID is required' });
            }

            const collectionName = `Board_${unit_ID}`;
            const collection = mongoose.connection.collection(collectionName);

            const query = {};
            if (start_date || end_date) {
                query.timestamp = {};
                if (start_date) query.timestamp.$gte = new Date(start_date);
                if (end_date) query.timestamp.$lte = new Date(end_date);
            }

            console.log('Generated Query:', query);

            const data = await collection.find(query).sort({ timestamp: 1 }).toArray();

            if (!data.length) {
                return res.status(404).json({ message: `No data found in collection: ${collectionName}` });
            }

            if (format === 'csv') {
                return generateCSV(data, res);
            } else if (format === 'pdf') {
                return generatePDF(data, res);
            } else {
                return res.status(400).json({ error: 'Invalid format. Please specify "csv" or "pdf" as the format.' });
            }
        } catch (error) {
            console.error('Error generating report:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
};

const generateCSV = (data, res) => {
    const csvStream = fastCsv.format({ headers: true });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=report.csv');

    csvStream.pipe(res);

    data.forEach((row) => {
        csvStream.write({
            unit_ID: row.unit_ID,
            t: row.t,
            h: row.h,
            w: row.w,
            eb: row.eb,
            ups: row.ups,
            x: row.x,
            y: row.y,
            timestamp: new Date(row.timestamp).toLocaleString(), // Convert timestamp
        });
    });

    csvStream.end();
};

const generatePDF = (data, res) => {
    const fonts = {
        Roboto: {
            normal: 'Helvetica',
            bold: 'Helvetica-Bold',
            italics: 'Helvetica-Oblique',
            bolditalics: 'Helvetica-BoldOblique',
        },
    };

    const printer = new pdfMake(fonts);

    // Table Headers
    const headers = [
        { text: 'Timestamp', bold: true },
        { text: 'Temperature', bold: true },
        { text: 'Humidity', bold: true },
        { text: 'Water Level', bold: true },
        { text: 'EB', bold: true },
        { text: 'UPS', bold: true },
        { text: 'X', bold: true },
        { text: 'Y', bold: true },
    ];

    // Table Data
    const tableBody = data.map((row) => [
        new Date(row.timestamp).toLocaleString(),
        row.t,
        row.h,
        row.w,
        row.eb,
        row.ups,
        row.x,
        row.y,
    ]);

    // Add headers at the top of the table body
    tableBody.unshift(headers);

    // PDF Document Definition
    const docDefinition = {
        content: [
            { text: `Report for Unit ID: ${data[0].unit_ID}`, style: 'header' },
            {
                table: {
                    headerRows: 1,
                    body: tableBody,
                },
                layout: {
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#aaaaaa',
                    vLineColor: () => '#aaaaaa',
                },
            },
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 0, 0, 10],
            },
        },
    };

    // Generate PDF
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const tempFilePath = path.join(__dirname, 'temp-report.pdf');

    pdfDoc.pipe(fs.createWriteStream(tempFilePath));

    pdfDoc.end();

    // Send the file
    pdfDoc.pipe(res).on('finish', () => {
        fs.unlinkSync(tempFilePath); // Cleanup the temp file
    });
};

module.exports = ReportController;
