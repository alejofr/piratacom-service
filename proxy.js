import express from "express";
import readline from "readline";
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

const app = express();
puppeteer.use(StealthPlugin());


app.use((req, res, next) => {
  console.log(`Interceptando solicitud: ${req.method} ${req.url}`);
  console.log(`Origin: ${req.headers.origin || 'Sin Origin'}`);
  console.log(`Headers:`, req.headers);

  // Continuar con el siguiente middleware o ruta
  next();
});
app.use('/backend-api', (req, res, next) => {
  console.log(`Interceptando solicitud en /backend-api: ${req.method} ${req.url}`);
  next();
});

let browser;
let page;

// Define cookies globally to ensure they are accessible in all scopes
let cookies = [];

(async () => {
  // Lanzar el navegador y abrir una nueva página
  browser = await puppeteer.launch({
    headless: false,
  });
  
  page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );
  await page.screenshot({ path: "debug-login-button.png" });

  // Navegar a la página de inicio de sesión
  await page.goto("https://chatgpt.com");

  // Esperar a que el botón de login esté disponible
  await page.waitForSelector('button[data-testid="login-button"]');

  // Hacer clic en el botón de login
  await page.click('button[data-testid="login-button"]');

  // Esperar a que el modal de login esté visible
  await page.waitForSelector('div[role="dialog"]');

  // Prompt the user to enter the email manually
  const rlEmail = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rlEmail.question(
    "Por favor, introduce tu correo electrónico: ",
    async (email) => {
      // Escribir el correo en el campo de entrada
      await page.type("input#email", email);
      rlEmail.close();

      // Hacer clic en el botón de continuar en el modal
      await page.waitForSelector(
        'div[role="dialog"] button.btn-primary[type="submit"]'
      );
      await page.click('div[role="dialog"] button.btn-primary[type="submit"]');

      // Wait for the password input field to be visible
      await page.waitForFunction(() => {
        const passwordInput = document.querySelector(
          'input[name="current-password"]'
        );
        return passwordInput && passwordInput.offsetParent !== null;
      });

      // Prompt the user to enter the password manually
      const rlPassword = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rlPassword.question(
        "Por favor, introduce tu contraseña: ",
        async (password) => {
          // Type the password into the input field
          await page.type('input[name="current-password"]', password);
          rlPassword.close();

          // Wait for the "Continue" button to be visible
          await page.waitForSelector('button[data-dd-action-name="Continue"]');
          // Click the "Continue" button
          await page.click('button[data-dd-action-name="Continue"]');

          // Wait for the verification code input field to be visible
          await page.waitForSelector('input[name="code"]');

          // Prompt the user to enter the verification code in the console
          const rlCode = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });

          rlCode.question(
            "Por favor, introduce el código de verificación enviado a tu correo: ",
            async (code) => {
              // Type the verification code into the input field
              await page.type('input[name="code"]', code);

              // Wait for the "Continue" button to be visible
              await page.waitForSelector(
                'button[data-dd-action-name="Continue"][name="intent"][value="validate"]'
              );
              // Click the "Continue" button
              await page.click(
                'button[data-dd-action-name="Continue"][name="intent"][value="validate"]'
              );

              // Wait for navigation or session confirmation
              await page.waitForNavigation();

              // Save cookies after successful login
              cookies = await page.cookies();
              console.log("✅ Cookies guardadas. Ya puedes acceder al proxy.");

              rlCode.close();
            }
          );
        }
      );
    }
  );

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    if (req.method === "OPTIONS") {
      res.status(200).end(); // Responder a solicitudes preflight
      return;
    }
    next();
  });

  // Endpoint para redirigir solicitudes al navegador activo
  app.use("/", async (req, res) => {
    try {
      // Redirigir la solicitud al navegador activo
      const targetUrl = `https://chatgpt.com${req.url}`;

      console.log(`Redirigiendo a: ${targetUrl}`);

      const headers = {
        Authorization: req.headers["authorization"], // Token de autorización
        "oai-client-version": req.headers["oai-client-version"],
        "oai-device-id": req.headers["oai-device-id"],
        "oai-language": req.headers["oai-language"],
        Origin: "https://chatgpt.com", // Cambiar Origin a chatgpt.com
        Referer: "https://chatgpt.com", // Cambiar Referer a chatgpt.com
        "Sec-CH-UA": req.headers["sec-ch-ua"],
        "Sec-CH-UA-Mobile": req.headers["sec-ch-ua-mobile"],
        "Sec-CH-UA-Platform": req.headers["sec-ch-ua-platform"],
        "User-Agent": req.headers["user-agent"],
      };

      // Configura las cookies si es necesario
      const cookies = await page.cookies();
      if (cookies.length > 0) {
        await page.setCookie(...cookies);
      }
      const response = await page.goto(targetUrl, {
        waitUntil: "networkidle2",
        headers,
      });
      const content = await response.text();

      res.send(content);
    } catch (error) {
      console.error("Error al redirigir la solicitud:", error);
      res.status(500).send("Error interno del servidor");
    }
  });

  // Mantener el navegador abierto
})();

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Inicando...`);
});
