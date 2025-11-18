// Middleware para endpoints tipo API (mejor proxy)

import "dotenv/config";
import express from "express";
import readline from "readline";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { createProxyMiddleware } from "http-proxy-middleware";
import https from "https";

import bodyParser from 'body-parser';
import { initDb, getStoredCookies, saveStoredCookies } from "./db.js";

const app = express();
puppeteer.use(StealthPlugin());

let browser;
let page;

(async () => {
  await initDb();
  // Lanzar el navegador y abrir una nueva página
  browser = await puppeteer.launch({
    headless: true,
    args: [
      "--disable-web-security",
      "--disable-features=IsolateOrigins",
      "--disable-site-isolation-trials",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--window-size=1920,1080",
    ],
  });

  page = await browser.newPage();
  // Deshabilitar la Política de Seguridad de Contenido
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );
  await page.setBypassCSP(true);
  // Interceptar y redirigir XHR/fetch/websocket a tu proxy
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const url = req.url();
    const resourceType = req.resourceType();
    // Solo intercepta XHR, fetch y WebSocket
    if (
      url.includes('chatgpt.com') &&
      ['xhr', 'fetch', 'websocket'].includes(resourceType)
    ) {
      // Redirige a tu proxy en vez de chatgpt.com
      const newUrl = url.replace('https://chatgpt.com', 'https://myagentia.local.lt');
      req.continue({ url: newUrl });
    } else {
      req.continue();
    }
  });
  // Captura de pantalla inicial para depuración
  await page.screenshot({ path: "debug-initial-headless.png" });

  // Intentar restaurar sesión desde cookies guardadas
  let sessionRestored = false;
  try {
    const saved = await getStoredCookies();
    if (saved && Array.isArray(saved) && saved.length > 0) {
      await page.setCookie(...saved);
      await page.goto("https://chatgpt.com", { waitUntil: "networkidle2" });
      // Si no aparece el botón de login asumimos sesión activa
      const loginBtn = await page.$('button[data-testid="login-button"]');
      if (!loginBtn) {
        console.log("✅ Sesión restaurada desde cookies en DB.");
        sessionRestored = true;
      } else {
        console.log(
          "⚠️ Cookies existentes pero la sesión no está activa, se hará login interactivo."
        );
      }
    } else {
      await page.goto("https://chatgpt.com", { waitUntil: "networkidle2" });
      console.log("ℹ️ No hay cookies guardadas, iniciando flujo de login.");
    }
  } catch (e) {
    console.error("Error intentando restaurar cookies:", e);
    await page.goto("https://chatgpt.com", { waitUntil: "networkidle2" });
  }

  if (!sessionRestored) {
    // Esperar a que el botón de login esté disponible y visible
    try {
      await page.waitForSelector('button[data-testid="login-button"]', {
        visible: true,
        timeout: 60000,
      });
      const loginButton = await page.$('button[data-testid="login-button"]');
      if (loginButton) {
        await loginButton.evaluate((btn) => btn.scrollIntoView());
        await loginButton.click();
      } else {
        console.error("El botón de login no se encontró.");
        await page.screenshot({ path: "debug-login-button-not-found.png" });
        return;
      }
    } catch (error) {
      console.error("Error al interactuar con el botón de login:", error);
      await page.screenshot({ path: "debug-login-button-error.png" });
      return;
    }
  }

  // No forzar espera de modal; solo seguiremos si no hay sesión

  if (!sessionRestored) {
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
        await page.click(
          'div[role="dialog"] button.btn-primary[type="submit"]'
        );

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
            await page.waitForSelector(
              'button[data-dd-action-name="Continue"]'
            );
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
                try {
                  await saveStoredCookies(cookies);
                  console.log(
                    "✅ Cookies guardadas en DB. Ya puedes acceder al proxy sin login la próxima vez."
                  );
                } catch (e) {
                  console.error("Error guardando cookies en DB:", e);
                }

                rlCode.close();
              }
            );
          }
        );
      }
    );
  }

  app.use("/", async (req, res) => {
    // Agregar encabezados CORS para permitir peticiones desde myagentia.local.lt
    res.header("Access-Control-Allow-Origin", "https://myagentia.local.lt");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, oai-client-version, oai-device-id, oai-language, Sec-CH-UA, Sec-CH-UA-Mobile, Sec-CH-UA-Platform, User-Agent"
    );
    res.header("Access-Control-Allow-Credentials", "true");

    // Manejar preflight OPTIONS
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    try {
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

      const pageCookies = await page.cookies();
      if (pageCookies.length > 0) {
        await page.setCookie(...pageCookies);
      }
      const response = await page.goto(targetUrl, {
        waitUntil: "networkidle2",
        headers,
      });
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        const url = req.url();
        const resourceType = req.resourceType();
        // Solo intercepta XHR, fetch y WebSocket
        if (
          url.includes("chatgpt.com") &&
          ["xhr", "fetch", "websocket"].includes(resourceType)
        ) {
          const newUrl = url.replace("chatgpt.com", "myagentia.loca.lt");
          req.continue({ url: newUrl });
        } else {
          req.continue();
        }
      });
      let content = await response.text();
      res.send(content);
    } catch (error) {
      console.error("Error al redirigir la solicitud:", error);
      res.status(500).send("Error interno del servidor");
    }
  });
})();

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Inicando...`);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(['/backend-api', '/ces'], async (req, res, next) => {
  // Agregar encabezados CORS para permitir peticiones desde myagentia.local.lt
  res.header("Access-Control-Allow-Origin", "https://myagentia.local.lt");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, oai-client-version, oai-device-id, oai-language, Sec-CH-UA, Sec-CH-UA-Mobile, Sec-CH-UA-Platform, User-Agent");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  try {
    const targetUrl = `https://chatgpt.com${req.originalUrl}`;
    const headers = { ...req.headers };
    headers.origin = "https://chatgpt.com";
    headers.referer = "https://chatgpt.com";
    headers.host = "chatgpt.com";

    const options = {
      method: req.method,
      headers,
    };
    if (req.method !== "GET" && req.method !== "HEAD") {
      options.body = JSON.stringify(req.body);
      headers['content-type'] = 'application/json';
    }

    const fetch = (await import('node-fetch')).default;
    const proxyResponse = await fetch(targetUrl, options);
    res.status(proxyResponse.status);
    proxyResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === "content-type") {
        res.setHeader(key, value);
      }
    });
    const buffer = await proxyResponse.buffer();
    res.send(buffer);
  } catch (error) {
    console.error("Error en el proxy API:", error);
    res.status(500).send("Error interno del proxy API");
  }
});