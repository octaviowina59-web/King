const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

const CACHE_DIR = path.join(__dirname, "cache");
fs.ensureDirSync(CACHE_DIR);

const BG_URL = "https://i.ibb.co/YmTfSwK/49661177be62.jpg";
const DEFAULT_AVATAR = "https://i.ibb.co/5x3z2Xv/group-icon.png";

// Cache global pour éviter de spammer FB quand t’as 100+ groupes
global.joinCache = global.joinCache || {};
const CACHE_TIME = 5 * 60 * 1000; // 5min

async function loadImg(url) {
  try {
    const res = await axios.get(url || DEFAULT_AVATAR, { responseType: "arraybuffer", timeout: 7000 });
    return await loadImage(Buffer.from(res.data));
  } catch {
    const res = await axios.get(DEFAULT_AVATAR, { responseType: "arraybuffer" });
    return await loadImage(Buffer.from(res.data));
  }
}

async function getInfo(api, tid) {
  // Cache 5min
  if (global.joinCache[tid] && Date.now() - global.joinCache[tid].time < CACHE_TIME) {
    return global.joinCache[tid].data;
  }

  try {
    const info = await api.getThreadInfo(tid);
    const data = {
      name: info.threadName || "Gate sans nom",
      photo: info.imageSrc || DEFAULT_AVATAR,
      members: info.participantIDs || [],
      tid
    };
    global.joinCache[tid] = { data, time: Date.now() };
    return data;
  } catch {
    return { name: "Gate inconnu", photo: DEFAULT_AVATAR, members: [], tid };
  }
}

async function makeListCard(groups, page, totalPages, userName, totalGroups) {
  const bg = await loadImg(BG_URL);
  const W = bg.width, H = bg.height;
  const cv = createCanvas(W, H);
  const ctx = cv.getContext("2d");

  ctx.drawImage(bg, 0, 0, W, H);
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(0, 0, W, H);

  // Header Illimité
  ctx.textAlign = "center";
  ctx.font = "bold 40px Arial";
  ctx.fillStyle = "#00d4ff";
  ctx.shadowColor = "#00d4ff";
  ctx.shadowBlur = 15;
  ctx.fillText("⚔️ PORTAIL INFINI ⚔️", W/2, 55);
  ctx.shadowBlur = 0;

  ctx.font = "bold 24px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText(`Hunter: ${userName}`, W/2, 90);

  ctx.font = "17px Arial";
  ctx.fillStyle = "#00d4ff";
  ctx.fillText(`Page ${page}/${totalPages} | ${totalGroups} Gates Total`, W/2, 120);

  // 5 groupes par page au lieu de 3
  let y = 155;
  const boxH = 70; // plus compact
  const avatarSize = 55;

  for (let i = 0; i < groups.length; i++) {
    const info = groups[i];
    const boxY = y + i * (boxH + 6);

    ctx.fillStyle = "rgba(10,30,60,0.85)";
    ctx.fillRect(30, boxY, W - 60, boxH);
    ctx.strokeStyle = "#00d4ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(30, boxY, W - 60, boxH);

    const avatar = await loadImg(info.photo);
    ctx.save();
    ctx.beginPath();
    ctx.arc(65, boxY + boxH/2, avatarSize/2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 37, boxY + 7, avatarSize, avatarSize);
    ctx.restore();

    // Numéro global pas juste 1-5
    const globalNum = (page - 1) * 5 + i + 1;
    ctx.textAlign = "left";
    ctx.font = "bold 26px Arial";
    ctx.fillStyle = "#00ffff";
    ctx.fillText(`${globalNum}`, 105, boxY + 28);

    ctx.font = "bold 20px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`『${info.name.slice(0,26)}』`, 140, boxY + 26);

    ctx.font = "15px Arial";
    ctx.fillStyle = "#aa00ff";
    ctx.fillText(`🗡️ ${info.members.length} Hunters`, 140, boxY + 46);
  }

  ctx.textAlign = "center";
  ctx.font = "bold 19px Arial";
  ctx.fillStyle = "#00ff88";
  ctx.fillText(`📲 Réponds 1-5 ou "next" "prev" "15"`, W/2, H - 25);

  const p = path.join(CACHE_DIR, `join_inf_${Date.now()}.png`);
  fs.writeFileSync(p, cv.toBuffer("image/png"));
  return p;
}

async function makeResultCard(type, d) {
  const bg = await loadImg(BG_URL);
  const W = bg.width, H = bg.height;
  const cv = createCanvas(W, H);
  const ctx = cv.getContext("2d");

  ctx.drawImage(bg, 0, 0, W, H);
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(0, 0, W, H);

  const col = type === "already"? "#ff8800" : "#00ff88";
  const title = type === "already"? "DÉJÀ DANS LE GATE" : "GATE REJOINT";

  ctx.textAlign = "center";
  ctx.font = "bold 44px Arial";
  ctx.fillStyle = col;
  ctx.shadowColor = col;
  ctx.shadowBlur = 20;
  ctx.fillText(title, W/2, 75);
  ctx.shadowBlur = 0;

  ctx.font = "bold 26px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText(`Hunter: ${d.userName}`, W/2, 120);

  const avatar = await loadImg(d.groupPhoto);
  ctx.save();
  ctx.beginPath();
  ctx.arc(W/2, 240, 65, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, W/2 - 65, 175, 130, 130);
  ctx.restore();

  ctx.strokeStyle = col;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(W/2, 240, 65, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = "bold 34px Arial";
  ctx.fillStyle = col;
  ctx.shadowColor = col;
  ctx.shadowBlur = 15;
  ctx.fillText(`『${d.groupName}』`, W/2, 330);
  ctx.shadowBlur = 0;

  const p = path.join(CACHE_DIR, `join_res_${Date.now()}.png`);
  fs.writeFileSync(p, cv.toBuffer("image/png"));
  return p;
}

module.exports = {
  config: {
    name: "join",
    version: "10.3",
    author: "Camille",
    countDown: 5,
    role: 0,
    description: "Rejoindre un Gate - Illimité 100+ groupes",
    category: "owner",
    guide: { fr: "{p}{n} | {p}{n} next | {p}{n} 15 | Répondre 1-5" }
  },

  onStart: async function ({ api, event, args = [], usersData, message }) {
    try {
      const userName = await usersData.getName(event.senderID);
      const list = await api.getThreadList(500, null, ["INBOX"]); // 500 au lieu de 200
      const groups = list.filter(g => g.isGroup && g.isSubscribed);

      if (!groups.length) return message.reply("❌ Aucun Gate trouvé.");

      const size = 5; // 5 groupes par page
      const pages = Math.ceil(groups.length / size);
      global.joinPage = global.joinPage || {};
      let page = global.joinPage[event.threadID] || 1;

      const inp = (args[0] || "").toLowerCase().trim();
      if (inp === "next") page++;
      else if (inp === "prev") page--;
      else if (/^\d+$/.test(inp)) page = parseInt(inp);
      page = Math.max(1, Math.min(page, pages));
      global.joinPage[event.threadID] = page;

      const slice = groups.slice((page-1)*size, page*size);

      await message.reply(`💙 Scan ${groups.length} Gates...`);

      const groupsInfo = [];
      for (const g of slice) {
        groupsInfo.push(await getInfo(api, g.threadID));
      }

      const img = await makeListCard(groupsInfo, page, pages, userName, groups.length);

      const msg = await message.reply({
        body: `⚔️ Portail ${page}/${pages} | Tape 1-5, "next", "prev" ou numéro de page`,
        attachment: fs.createReadStream(img)
      });

      global.GoatBot.onReply.set(msg.messageID, {
        commandName: "join",
        author: event.senderID,
        list: groups,
        page,
        pageSize: size,
        userName
      });

      setTimeout(() => fs.removeSync(img), 25000);

    } catch (e) {
      console.error(e);
      message.reply("⚠️ Erreur: " + e.message);
    }
  },

  onReply: async function ({ api, event, Reply, args = [], usersData, message }) {
    const { author, list, page, pageSize, userName } = Reply;
    if (event.senderID!== author) return;

    const n = parseInt(args[0], 10);
    if (!n || n < 1 || n > pageSize) return message.reply(`⚠️ Numéro invalide. Tape 1-${pageSize}`, event.messageID);

    const slice = list.slice((page-1)*pageSize, page*pageSize);
    const sel = slice[n-1];
    if (!sel) return message.reply("⚠️ Groupe introuvable", event.messageID);

    try {
      const info = await getInfo(api, sel.threadID);

      if (info.members.includes(event.senderID)) {
        await message.reply(`⚠️ Tu es déjà dans 『${info.name}』`);
        const img = await makeResultCard("already", {
          userName,
          groupName: info.name,
          groupPhoto: info.photo
        });
        return message.reply({ attachment: fs.createReadStream(img) }, () => fs.removeSync(img));
      }

      if (info.members.length >= 250) {
        return message.reply(`🚫 Gate complet: 『${info.name}』`, event.messageID);
      }

      await api.addUserToGroup(event.senderID, sel.threadID);

      const img = await makeResultCard("success", {
        userName,
        groupName: info.name,
        groupPhoto: info.photo
      });
      return message.reply({
        body: `✅ Bienvenue dans 『${info.name}』! Arise!`,
        attachment: fs.createReadStream(img)
      }, () => fs.removeSync(img));

    } catch (e) {
      console.error(e);
      message.reply("❌ Échec. Le bot est admin du groupe?", event.messageID);
    }
  }
};
