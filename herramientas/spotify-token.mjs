// Obtiene, UNA sola vez, el "refresh token" de tu cuenta de Spotify para la
// función now-playing de Netlify. No guarda nada en disco: solo lo imprime.
//
// Uso (PowerShell), desde la carpeta del sitio:
//   $env:SPOTIFY_CLIENT_ID = "..."        # de tu app en developer.spotify.com
//   $env:SPOTIFY_CLIENT_SECRET = "..."
//   node --use-system-ca herramientas/spotify-token.mjs
//
// --use-system-ca hace que Node confíe en los certificados de Windows. Es
// necesario en este equipo: el antivirus (Kaspersky) inspecciona HTTPS y firma
// con su propio certificado, que Windows conoce y Node no. Sin la opción, la
// conexión a Spotify falla con SELF_SIGNED_CERT_IN_CHAIN.
//
// Antes, en la app de Spotify, agrega esta Redirect URI exacta:
//   http://127.0.0.1:8888/callback
//
// Permisos que pide: solo leer qué suena y lo escuchado recientemente.

import http from "node:http";
import crypto from "node:crypto";

const PORT = 8888;
const REDIRECT = `http://127.0.0.1:${PORT}/callback`;
const SCOPES = "user-read-currently-playing user-read-recently-played";
const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret } = process.env;

if (!id || !secret) {
  console.error("Faltan SPOTIFY_CLIENT_ID y/o SPOTIFY_CLIENT_SECRET en las variables de entorno.");
  process.exit(1);
}

const state = crypto.randomBytes(16).toString("hex");
const authUrl = "https://accounts.spotify.com/authorize?" + new URLSearchParams({
  client_id: id, response_type: "code", redirect_uri: REDIRECT, scope: SCOPES, state,
});

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT);
  if (url.pathname !== "/callback") { res.writeHead(404).end(); return; }

  const fin = (msg) => {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" }).end(msg);
    server.close();
  };

  if (url.searchParams.get("state") !== state) return fin("El parámetro state no coincide. Vuelve a ejecutar el script.");
  if (url.searchParams.get("error")) return fin("Spotify devolvió: " + url.searchParams.get("error"));

  let r;
  try {
    r = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(id + ":" + secret).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ grant_type: "authorization_code", code: url.searchParams.get("code"), redirect_uri: REDIRECT }),
    });
  } catch (err) {
    const codigo = err.cause?.code || err.message;
    console.error("\nNo se pudo conectar con Spotify (" + codigo + ").");
    if (/CERT|SELF_SIGNED/.test(codigo)) {
      console.error("Un antivirus o proxy está inspeccionando HTTPS. Ejecuta de nuevo así:");
      console.error("  node --use-system-ca herramientas/spotify-token.mjs\n");
    }
    return fin("No se pudo conectar con Spotify; mira la terminal.");
  }
  const j = await r.json();
  if (!r.ok || !j.refresh_token) {
    console.error("No se obtuvo el token:", j);
    return fin("No se obtuvo el token; mira la terminal.");
  }

  console.log("\nListo. Copia este valor en Netlify como SPOTIFY_REFRESH_TOKEN:\n");
  console.log(j.refresh_token + "\n");
  console.log("No lo pegues en el repo ni lo compartas.");
  fin("Listo: el token quedó impreso en la terminal. Ya puedes cerrar esta pestaña.");
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("Abre esta dirección en tu navegador, inicia sesión en Spotify y acepta:\n");
  console.log(authUrl + "\n");
});
