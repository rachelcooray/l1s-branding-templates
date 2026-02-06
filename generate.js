const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs-extra');
const path = require('path');

async function generatePDF() {
    try {
        // 1. Get arguments
        const args = process.argv.slice(2);
        const type = args[0] || 'invoice'; // default to invoice

        console.log(`🚀 Generating ${type}...`);

        // 2. Load data
        const dataPath = path.join(__dirname, 'data', `${type}.json`);
        if (!await fs.pathExists(dataPath)) {
            throw new Error(`Data file not found: ${dataPath}`);
        }
        const data = await fs.readJson(dataPath);

        // 3. Load and compile template
        const templatePath = path.join(__dirname, 'templates', `${type}.html`);
        if (!await fs.pathExists(templatePath)) {
            throw new Error(`Template not found: ${templatePath}`);
        }
        let templateHtml = await fs.readFile(templatePath, 'utf-8');

        // Inject base path to resolve relative assets (CSS, images)
        const baseUrl = `file://${path.join(__dirname, 'templates')}/`;
        templateHtml = templateHtml.replace('<head>', `<head><base href="${baseUrl}">`);

        const template = handlebars.compile(templateHtml);
        const finalHtml = template(data);

        // 4. Launch browser
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--allow-file-access-from-files']
        });
        const page = await browser.newPage();

        // 5. Set content and wait for it to load
        await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

        // 6. Generate PDF
        const outputPath = path.join(__dirname, 'output', `${type}.pdf`);
        await fs.ensureDir(path.dirname(outputPath));

        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px'
            }
        });

        await browser.close();
        console.log(`✅ Success! PDF saved to: ${outputPath}`);

    } catch (error) {
        console.error('❌ Error generating PDF:', error);
        process.exit(1);
    }
}

generatePDF();
