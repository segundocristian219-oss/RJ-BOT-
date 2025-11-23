// plugins/antiarabe.js — sistema completo ESM + tmp/antiarabe.json
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// =========================
// BASE DE DATOS EN ./tmp/
// =========================
const TMP_DIR  = path.join(process.cwd(), "tmp");
const DB_FILE  = path.join(TMP_DIR, "antiarabe.json");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "{}");

const loadDB = () => {
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); }
  catch { return {}; }
};
const saveDB = db => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

const enableGroup  = chatId => { const db = loadDB(); db[chatId] = 1; saveDB(db); };
const disableGroup = chatId => { const db = loadDB(); delete db[chatId]; saveDB(db); };
const isEnabled    = chatId => !!loadDB()[chatId];


// =========================
// LISTA DE PREFIJOS ÁRABES
// =========================
const ARABES = [
  "20","212","213","216","218","222","224","230","234","235","237","238","249",
  "250","251","252","253","254","255","257","258","260","263","269","960","961",
  "962","963","964","965","966","967","968","970","971","972","973","974","975","976"
];

const DIGITS = s => String(s || "").replace(/\D/g, "");

// Detectar si un número es árabe
const isArab = jid => {
  const num = DIGITS(jid);
  return ARABES.some(pre => num.startsWith(pre));
};


// =========================
// VERIFICAR ADMIN LID y normal
// =========================
function lidParser(participants = []) {
  return participants.map(v => ({
    id: (typeof v?.id === "string" && v.id.endsWith("@lid") && v.jid) ? v.jid : v.id,
    admin: v?.admin ?? null
  }));
}

async function isAdminByNumber(conn, chatId, number) {
  try {
    const meta = await conn.groupMetadata(chatId);
    const raw  = meta?.participants || [];
    const norm = lidParser(raw);

    const adminNums = new Set();
    for (let i = 0; i < raw.length; i++) {
      const r = raw[i], n = norm[i];
      const flag = (r?.admin === "admin" || r?.admin === "superadmin" ||
                    n?.admin === "admin" || n?.admin === "superadmin");

      if (flag) {
        [r?.id, r?.jid, n?.id].forEach(x => {
          const d = DIGITS(x || "");
          if (d) adminNums.add(d);
        });
      }
    }

    return adminNums.has(number);
  } catch {
    return false;
  }
}


// =========================
// HANDLER COMANDO .antiarabe on/off
// =========================
async function antiarabeCommand(msg, { conn }) {
  const chatId    = msg.key.remoteJid;
  const senderJid = msg.key.participant || msg.key.remoteJid;
  const senderNo  = DIGITS(senderJid);
  const isFromMe  = msg.key.fromMe;

  if (!chatId.endsWith("@g.us")) {
    return conn.sendMessage(chatId, { text: "❌ Este comando solo puede usarse en grupos." }, { quoted: msg });
  }

  await conn.sendMessage(chatId, { react: { text: "🛡️", key: msg.key } });

  const isAdmin = await isAdminByNumber(conn, chatId, senderNo);

  // Cargar owners si quieres
  let owners = [];
  try { owners = JSON.parse(fs.readFileSync(path.join(__dirname, "../owner.json"), "utf8")); }
  catch { owners = global.owner || []; }

  const isOwner = Array.isArray(owners) && owners.some(([id]) => id === senderNo);

  if (!isAdmin && !isOwner && !isFromMe) {
    return conn.sendMessage(chatId, { text: "🚫 Solo los administradores pueden activar/desactivar." }, { quoted: msg });
  }

  const body   = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
  const estado = (body.split(" ")[1] || "").toLowerCase();

  if (!["on", "off"].includes(estado)) {
    return conn.sendMessage(chatId, { text: "✳️ Usa:\n\n.antiarabe on / off" }, { quoted: msg });
  }

  if (estado === "on") enableGroup(chatId);
  else disableGroup(chatId);

  await conn.sendMessage(chatId, {
    text: `🛡️ AntiÁrabe se ha *${estado === "on" ? "activado" : "desactivado"}*.`
  }, { quoted: msg });

  await conn.sendMessage(chatId, { react: { text: "✅", key: msg.key } });
}


// =========================
// HANDLER EVENTO: expulsión automática
// =========================
async function antiarabeDetector(update, { conn }) {
  const { id: chatId, participants, action } = update;

  if (action !== "add") return;          // solo cuando alguien entra
  if (!isEnabled(chatId)) return;        // antiarabe OFF → ignorar

  for (const jid of participants) {
    if (isArab(jid)) {
      await conn.groupParticipantsUpdate(chatId, [jid], "remove").catch(() => {});
      await conn.sendMessage(chatId, {
        text: `🚫 Usuario eliminado automáticamente por prefijo árabe.`
      });
    }
  }
}


// =========================
// EXPORTAR TODO
// =========================
const handler = {
  command: ["antiarabe"],
  handler: antiarabeCommand,
  events: {
    "group-participants.update": antiarabeDetector
  }
};

export default handler;