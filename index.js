const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const app = express();
const PORT = 3000;

// Route to serve ChatGPT interface
app.get('/', async (req, res) => {
  try {
    // Launch Puppeteer with stealth plugin
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Set User-Agent to mimic a real browser
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );

    // Navigate to ChatGPT
    await page.goto('https://chat.openai.com', {
      waitUntil: 'networkidle2',
    });

    // Get the HTML content of the page
    const content = await page.content();

    // Close the browser
    await browser.close();

    // Send the content to the client
    res.send(content);
  } catch (error) {
    console.error('Error rendering ChatGPT:', error);
    res.status(500).send('An error occurred while rendering ChatGPT.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});