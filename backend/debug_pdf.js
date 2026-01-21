
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

try {
    const pdf = require('pdf-parse');
    console.log('pdf.PDFParse:', typeof pdf.PDFParse);

    try {
        const direct = require('pdf-parse/lib/pdf-parse.js');
        console.log('direct require type:', typeof direct);
    } catch (e) { console.log('direct require failed'); }

} catch (e) {
    console.error(e);
}
