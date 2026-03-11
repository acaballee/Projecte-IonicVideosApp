import fs from 'fs';
import { marked } from 'marked';
import puppeteer from 'puppeteer';
import path from 'path';

const markdownPath = '/home/alex/Documents/Programació Multimèdia/Projecte-IonicVideosApp/DOCUMENTACIO.md';
const pdfPath = '/home/alex/Documents/Programació Multimèdia/Projecte-IonicVideosApp/DOCUMENTACIO.pdf';
const logoPath = '/home/alex/Documents/Programació Multimèdia/Projecte-IonicVideosApp/ionic-logo.png';
const brainPath = '/home/alex/.gemini/antigravity/brain/44199c06-66db-4386-a36b-b14b8cc4429b/';

function toBase64(filePath) {
    try {
        const file = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);
        const ext = path.extname(fileName).substring(1);
        return `data:image/${ext};base64,${file.toString('base64')}`;
    } catch (e) {
        console.warn(`Could not load image: ${filePath}`);
        return '';
    }
}

(async () => {
    let markdown = fs.readFileSync(markdownPath, 'utf8');
    
    // Replace image paths in markdown with Base64
    const imgRegex = /!\[.*?\]\((.*?)\)/g;
    let match;
    const imagesToReplace = [];
    while ((match = imgRegex.exec(markdown)) !== null) {
        imagesToReplace.push(match[1]);
    }

    for (const imgPath of imagesToReplace) {
        const absolutePath = imgPath.startsWith('/') ? imgPath : path.join(path.dirname(markdownPath), imgPath);
        const base64 = toBase64(absolutePath);
        if (base64) {
            markdown = markdown.replace(imgPath, base64);
        }
    }

    let htmlContent = marked.parse(markdown);
    
    // Wrap images in a container and add class
    htmlContent = htmlContent.replace(/<img (.*?)>/g, '<div class="image-container"><img class="screenshot" $1></div>');

    const logoBase64 = toBase64(logoPath);

    const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
            
            body { 
                font-family: 'Inter', sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0;
                padding: 0;
                background: white;
            }
            
            /* Cover Page Styling */
            .cover-page {
                height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
                text-align: center;
                padding: 60px 40px;
                box-sizing: border-box;
                page-break-after: always;
            }
            
            .cover-title {
                font-size: 42px;
                font-weight: 700;
                margin-top: 50px;
                color: #000;
            }
            
            .cover-logo {
                width: 400px;
                margin: 60px 0;
            }
            
            .cover-info {
                width: 100%;
                text-align: right;
                font-size: 16px;
                color: #333;
                margin-bottom: 50px;
            }
            
            .cover-info p {
                margin: 5px 0;
            }
            
            .cover-info a {
                color: #3498db;
                text-decoration: none;
            }

            /* Content Styling */
            .content {
                max-width: 900px; 
                margin: 0 auto; 
                padding: 40px 60px;
            }
            
            h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-top: 40px; }
            h2 { color: #2980b9; margin-top: 30px; border-left: 4px solid #3498db; padding-left: 15px; }
            h3 { color: #34495e; margin-top: 25px; }
            
            .image-container {
                text-align: center;
                margin: 30px 0;
            }
            
            img.screenshot { 
                width: 100%;
                height: auto;
                max-width: 100%;
                border-radius: 8px; 
                box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
                display: block;
                margin: 0 auto;
            }
            
            code { background: #f4f4f4; padding: 2px 5px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
            pre { background: #2d3436; color: #dfe6e9; padding: 15px; border-radius: 8px; overflow-x: auto; font-size: 0.9em; }
            
            @media print {
                .cover-page { height: 100vh; }
                .content { padding: 20px; }
                h1, h2, h3 { page-break-after: avoid; }
                img { page-break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <div class="cover-page">
            <div class="cover-title">Projecte Ionic Videos App</div>
            <img class="cover-logo" src="${logoBase64}" alt="Ionic Logo">
            <div class="cover-info">
                <p>Professor: Joan Pasqual Almudeve</p>
                <p>Assignatura: Programació multimèdia i dispositius mòbils</p>
                <p>Fet per: Alex Caballé</p>
                <p>Repositori git: <a href="https://github.com/acaballee/Projecte-IonicVideosApp">https://github.com/acaballee/Projecte-IonicVideosApp</a></p>
            </div>
        </div>
        <div class="content">
            ${htmlContent}
        </div>
    </body>
    </html>
    `;

    const browser = await puppeteer.launch({ 
        headless: 'new', 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    
    await page.pdf({
        path: pdfPath,
        format: 'A4',
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        printBackground: true
    });

    await browser.close();
    console.log('PDF generated at ' + pdfPath);
})();
