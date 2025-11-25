const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const app = express();
const PORT = 3000;

// Ruta para servir la interfaz de ChatGPT
app.get('/', async (req, res) => {
  try {
    // Lanzar Puppeteer con el plugin stealth
    const browser = await puppeteer.launch({
    //   executablePath: '/usr/bin/google-chrome',
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-site-isolation-trials',
        '--disable-setuid-sandbox',
      ],
    });

    const page = await browser.newPage();

    // Configurar User-Agent para imitar un navegador real
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );

    // Navegar a ChatGPT
    await page.goto('https://chat.openai.com', {
      waitUntil: 'networkidle2',
    });

    // Obtener el contenido HTML de la página
    const content = await page.content();

    // Cerrar el navegador
    await browser.close();

    // Enviar el contenido al cliente
    res.send(content);
  } catch (error) {
    console.error('Error rendering ChatGPT:', error);
    res.status(500).send('An error occurred while rendering ChatGPT.');
  }
});

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});