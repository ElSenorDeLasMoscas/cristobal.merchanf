// Función de Netlify: qué está sonando en Spotify (o lo último que sonó).
//
// Responde en /.netlify/functions/now-playing con un JSON mínimo:
//   { playing: true|false, title, artist, url, cover, playedAt? }
// Si no hay nada que mostrar responde { playing: false } sin título, y el
// widget del sitio se oculta.
//
// Las credenciales NO están en el código: se leen de las variables de entorno
// del sitio en Netlify (SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET,
// SPOTIFY_REFRESH_TOKEN). Ver README_PERSONALIZACION.md, sección Spotify.

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_URL = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENT_URL = "https://api.spotify.com/v1/me/player/recently-played?limit=1";

async function accessToken() {
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refresh } = process.env;
  if (!id || !secret || !refresh) throw new Error("Faltan variables de entorno de Spotify");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(id + ":" + secret).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh }),
  });
  if (!res.ok) throw new Error("Spotify rechazó el token: " + res.status);
  return (await res.json()).access_token;
}

/* Solo canciones (no podcasts) y solo los campos que el sitio muestra. */
function resumen(track) {
  if (!track || track.type !== "track") return null;
  const imagenes = track.album?.images || [];
  return {
    title: track.name,
    artist: (track.artists || []).map((a) => a.name).join(", "),
    url: track.external_urls?.spotify || null,
    cover: imagenes.length ? imagenes[imagenes.length - 1].url : null, // la más chica
  };
}

function json(body, status, cache) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": cache ? "public, max-age=30" : "no-store",
      // Netlify guarda la respuesta un minuto: muchas visitas = una sola consulta a Spotify.
      ...(cache ? { "Netlify-CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" } : {}),
    },
  });
}

export default async () => {
  try {
    const headers = { Authorization: "Bearer " + (await accessToken()) };

    const ahora = await fetch(NOW_URL, { headers });
    if (ahora.status === 200) {
      const j = await ahora.json();
      const t = j.is_playing ? resumen(j.item) : null;
      if (t) return json({ playing: true, ...t }, 200, true);
    }

    const reciente = await fetch(RECENT_URL, { headers });
    if (reciente.ok) {
      const item = (await reciente.json()).items?.[0];
      const t = item ? resumen(item.track) : null;
      if (t) return json({ playing: false, ...t, playedAt: item.played_at }, 200, true);
    }

    return json({ playing: false }, 200, true);
  } catch (err) {
    console.error(err);
    return json({ error: true }, 502, false);
  }
};
