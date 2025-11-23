import fetch from 'node-fetch';
import axios from 'axios';

const apis = {
  fallback: 'https://delirius-apiofc.vercel.app/'
};

const handler = async (m, { args, conn, command, prefix }) => {
  if (!args[0]) {
    let ejemplos = ['Adele Hello', 'Sia Unstoppable', 'Maroon 5 Memories', 'Karol G Provenza', 'Natalia Jiménez Creo en mí'];
    let random = ejemplos[Math.floor(Math.random() * ejemplos.length)];
    return conn.reply(m.chat, `⚠️ Ejemplo de uso: ${(prefix || '.') + command} ${random}`, m);
  }

  await conn.sendMessage(m.chat, { react: { text: '⏱', key: m.key } });

  const query = encodeURIComponent(args.join(' '));

  // Función para buscar en la API principal con timeout de 6s
  const fetchWithTimeout = (url, timeout = 6000) =>
    Promise.race([
      fetch(url).then(res => res.json()),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
    ]);

  try {
    let json;

    try {
      // Intentar API principal
      json = await fetchWithTimeout(`https://api.delirius.store/search/spotify?q=${query}`);
      if (!json.status || !json.data || json.data.length === 0) throw new Error('No hay resultados');
    } catch {
      // Si falla o timeout, usar fallback silenciosa
      const { data } = await axios.get(`${apis.fallback}search/spotify?q=${query}&limit=10`);
      if (!data.data || data.data.length === 0) throw new Error('No hay resultados en fallback');
      json = { data: data.data[0] };
    }

    const track = json.data[0] || json.data; // compatibilidad con ambos formatos
    const downloadUrl = track.url.includes('spotify') 
      ? `https://api.delirius.store/download/spotifydl?url=${encodeURIComponent(track.url)}` 
      : track.url;

    // Enviar info
    const caption = `
╔═══『 SPOTIFY 🎶 』
║ ✦  Título: ${track.title}
║ ✦  Artista: ${track.artist}
║ ✦  Álbum: ${track.album || 'Desconocido'}
║ ✦  Duración: ${track.duration || 'Desconocida'}
║ ✦  Popularidad: ${track.popularity || 'N/A'}
║ ✦  Publicado: ${track.publish || 'N/A'}
║ ✦  Link: ${track.url}
╚═════════════════╝`;

    await conn.sendMessage(m.chat, { image: { url: track.image }, caption }, { quoted: m });

    // Descargar audio con fallback si falla
    let audioUrl;
    try {
      const res = await fetch(downloadUrl);
      const dl = await res.json();
      audioUrl = dl.data.url;
      if (!audioUrl) throw new Error('No URL');
    } catch {
      // Fallback descarga
      try {
        const res2 = await fetch(`${apis.fallback}download/spotifydlv3?url=${encodeURIComponent(track.url)}`);
        const dl2 = await res2.json();
        audioUrl = dl2.data.url;
      } catch (e) {
        return m.reply('❌ No se pudo descargar el audio', m);
      }
    }

    await conn.sendMessage(m.chat, { audio: { url: audioUrl }, mimetype: 'audio/mpeg', fileName: `${track.title}.mp3` }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (e) {
    console.log(e);
    m.reply('⚠️ Ocurrió un error al buscar o descargar la canción.', m);
  }
};

handler.help = ['spotify <canción>'];
handler.tags = ['busqueda', 'descargas'];
handler.command = ['spotify'];

export default handler;