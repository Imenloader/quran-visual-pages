const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function run() {
    try {
        let buffer = fs.readFileSync('mujem_alqurqn_549.pdf');
        // Convert Buffer to Uint8Array
        const uint8Array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        
        const parser = new PDFParse(uint8Array);
        const result = await parser.getText();
        
        fs.writeFileSync('pdf_extracted.txt', result.text);
        console.log('PDF text extracted to pdf_extracted.txt');
        console.log('Total pages:', result.pages.length);
    } catch (err) {
        console.error('Error parsing PDF:', err);
    }
}

run();
