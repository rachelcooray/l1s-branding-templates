const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs-extra');
const path = require('path');

async function processFile(type, browser) {
    try {
        console.log(`🚀 Generating ${type}...`);

        // 1. Load data
        const dataPath = path.join(__dirname, 'data', `${type}.json`);
        if (!await fs.pathExists(dataPath)) {
            console.warn(`⚠️  Data file not found for ${type}, skipping...`);
            return;
        }
        const data = await fs.readJson(dataPath);

        // 2. Load and compile template
        const templatePath = path.join(__dirname, 'templates', `${type}.html`);
        if (!await fs.pathExists(templatePath)) {
            console.warn(`⚠️  Template not found for ${type}, skipping...`);
            return;
        }
        let templateHtml = await fs.readFile(templatePath, 'utf-8');

        // Inject base path to resolve relative assets
        const baseUrl = `file://${path.join(__dirname, 'templates')}/`;
        templateHtml = templateHtml.replace('<head>', `<head><base href="${baseUrl}">`);

        const template = handlebars.compile(templateHtml);
        const finalHtml = template(data);

        // 3. Set content and generate PDF
        const page = await browser.newPage();
        await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

        const outputPath = path.join(__dirname, 'output', `${type}.pdf`);
        await fs.ensureDir(path.dirname(outputPath));

        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        });

        await page.close();
        console.log(`✅ Success! PDF saved to: ${outputPath}`);
    } catch (error) {
        console.error(`❌ Error generating ${type}:`, error);
    }
}

async function generatePDFs() {
    let browser;
    try {
        const args = process.argv.slice(2);
        const typeArg = args[0] || 'invoice';

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--allow-file-access-from-files', '--no-sandbox']
        });

        if (typeArg === '--all') {
            const dataFiles = await fs.readdir(path.join(__dirname, 'data'));
            const types = dataFiles
                .filter(file => file.endsWith('.json'))
                .map(file => file.replace('.json', ''));

            for (const type of types) {
                await processFile(type, browser);
            }
        } else {
            await processFile(typeArg, browser);
        }

    } catch (error) {
        console.error('❌ Critical Error:', error);
        process.exit(1);
    } finally {
        if (browser) await browser.close();
    }
}

generatePDFs();
