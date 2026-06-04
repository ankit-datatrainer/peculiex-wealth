const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  
  // Wait for 3 seconds to let hard timeout fire
  await new Promise(r => setTimeout(r, 3000));
  
  const preloader = await page.evaluate(() => {
    const el = document.getElementById('preloader');
    if (!el) return null;
    const computed = window.getComputedStyle(el);
    return {
      className: el.className,
      opacity: computed.opacity,
      visibility: computed.visibility,
      display: computed.display,
      pointerEvents: computed.pointerEvents,
      zIndex: computed.zIndex
    };
  });
  
  console.log("PRELOADER STATE:", preloader);
  
  await browser.close();
})();
