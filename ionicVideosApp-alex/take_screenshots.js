import puppeteer from 'puppeteer';
import path from 'path';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 600 });

  console.log('Taking Home page screenshot...');
  let maxRetries = 10;
  while(maxRetries > 0) {
      try {
          await page.goto('http://localhost:5173/home', { waitUntil: 'networkidle2' });
          break;
      } catch (e) {
          console.log("retry " + maxRetries);
          await new Promise(r => setTimeout(r, 1000));
          maxRetries--;
      }
  }
  // Wait a bit for Ionic to stabilize
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'frontend-home.png' });

  console.log('Taking Login page screenshot...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'frontend-login.png' });

  console.log('Taking Register page screenshot...');
  await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'frontend-register.png' });

  // For User page, since it requires auth, we'll just capture the Login page as a proxy 
  // or the user can provide one if it's critical. 
  // Actually, let's try to capture it and see if it redirects.
  console.log('Taking User page screenshot (may redirect)...');
  await page.goto('http://localhost:5173/user', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'frontend-user.png' });

  await browser.close();
  console.log('Done! Screenshots saved as frontend-*.png');
})();
