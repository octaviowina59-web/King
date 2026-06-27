const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const GIFEncoder = require("gifencoder");
const { createCanvas, loadImage } = require("canvas");

const CACHE_DIR = path.join(__dirname, "cache");
fs.ensureDirSync(CACHE_DIR);

// TON GIF SOLO LEVELING
const SOLO_LEVELING_GIF = "https://i.ibb.co/JRF9mScB/d4a82da50f79.gif";

async function fetchBuffer(url) {
  try {
    const res = await axios.get(url, { responseType: "arraybuffer", timeout: 20000 });
    return Buffer.from(res.data);
  } catch (e) {
    console.log("Erreur fetch GIF:", e.message);
    return null;
  }
}

async function generatePrefixGif(newPrefix, threadName, type) {
  const W = 850, H = 480;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const encoder = new GIFEncoder(W, H);
  const outPath = path.join(CACHE_DIR, `prefix_${Date.now()}.gif`);
  encoder.createReadStream().pipe(fs.createWriteStream(outPath));

  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(100);
  encoder.setQuality(12);

  let backgroundFrame = null;
  try {
    const gifBuffer = await fetchBuffer(SOLO_LEVELING_GIF);
    if (gifBuffer) backgroundFrame = await loadImage(gifBuffer);
  } catch (e) {}

  const isGlobal = type === "global";
  const mainText = isGlobal? "SYSTEM UPDATE" : "DUNGEON CLEARED";
  const subText = isGlobal? "Prefix global modifié" : "Prefix du groupe modifié";
  const color = isGlobal? "#00d4ff" : "#00ff88";

  for (let frameIndex = 0; frameIndex < 12; frameIndex++) {
    ctx.clearRect(0, 0, W, H);

    if (backgroundFrame) {
      ctx.drawImage(backgroundFrame, 0, -(frameIndex * 3), W, H + 30);
    } else {
      ctx.fillStyle = "#0a0a1a";
      ctx.fillRect(0, 0, W, H);
    }

    ctx.fillStyle = "rgba(0, 10, 30, 0.65)";
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = color;
    ctx.font = "bold 65px Arial";
    ctx.textAlign = "center";
    const texts = ["HUNTER", "S-RANK", "LEVEL UP", "SYSTEM", "SHADOW"];
    for (let i = 0; i < texts.length; i++) {
      ctx.save();
      let x = W/2 + Math.cos(frameIndex * 0.4 + i) * 210;
      let y = H/2 + Math.sin(frameIndex * 0.4 + i) * 150;
      let angle = (frameIndex * 0.15 + i) * 0.5;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(texts[i], 0, 0);
      ctx.restore();
    }
    ctx.restore();

    ctx.fillStyle = color;
    ctx.font = "bold 50px Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = color;
    ctx.shadowBlur = 35;
    ctx.fillText(mainText, W/2, 100);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#ffffff";
    ctx.font = "24px Arial";
    ctx.fillText(subText, W/2, 140);

    const boxX = W/2 - 230;
    const boxY = 195;
    const boxW = 460;
    const boxH = 140;

    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.shadowColor = color;
    ctx.shadowBlur = 30;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Nouveau Préfixe", W/2, boxY + 45);

    ctx.fillStyle = color;
    ctx.font = "bold 78px monospace";
    ctx.shadowColor = color;
    ctx.shadowBlur = 25;
    ctx.fillText(newPrefix, W/2, boxY + 105);
    ctx.shadowBlur = 0;

    if (!isGlobal && threadName) {
      ctx.fillStyle = "#bbbbbb";
      ctx.font = "16px Arial";
      ctx.fillText("Groupe: " + threadName, W/2, boxY + boxH + 30);
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      let x1 = 40 + i * 100;
      let y1 = H - 40 + Math.sin(frameIndex * 0.6 + i) * 20;
      let x2 = x1 + 25;
      let y2 = y1 - 45;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(0, 212, 255, 0.9)";
    ctx.font = "14px Arial";
    ctx.textAlign = "right";
    ctx.fillText("System: Shadow Monarch v3.1", W - 20, H - 15);

    encoder.addFrame(ctx);
  }

  encoder.finish();
  await new Promise(resolve => setTimeout(resolve, 800));
  return outPath;
}

async function generateStatusGif(globalPrefix, threadPrefix, userName) {
  const W = 850, H = 480;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const encoder = new GIFEncoder(W, H);
  const outPath = path.join(CACHE_DIR, `status_${Date.now()}.gif`);
  encoder.createReadStream().pipe(fs.createWriteStream(outPath));

  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(100);
  encoder.setQuality(12);

  let backgroundFrame = null;
  try {
    const gifBuffer = await fetchBuffer(SOLO_LEVELING_GIF);
    if (gifBuffer) backgroundFrame = await loadImage(gifBuffer);
  } catch (e) {}

  const color = "#00d4ff";

  for (let frameIndex = 0; frameIndex < 12; frameIndex++) {
    ctx.clearRect(0, 0, W, H);

    if (backgroundFrame) {
      ctx.drawImage(backgroundFrame, 0, -(frameIndex * 3), W, H + 30);
    } else {
      ctx.fillStyle = "#0a0a1a";
      ctx.fillRect(0, 0, W, H);
    }

    ctx.fillStyle = "rgba(0, 10, 30, 0.65)";
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = color;
    ctx.font = "bold 65px Arial";
    ctx.textAlign = "center";
    const texts = ["HUNTER", "S-RANK", "LEVEL UP", "SYSTEM", "SHADOW"];
    for (let i = 0; i < texts.length; i++) {
      ctx.save();
      let x = W/2 + Math.cos(frameIndex * 0.4 + i) * 210;
      let y = H/2 + Math.sin(frameIndex * 0.4 + i) * 150;
      let angle = (frameIndex * 0.15 + i) * 0.5;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(texts[i], 0, 0);
      ctx.restore();
    }
    ctx.restore();

    ctx.fillStyle = color;
    ctx.font = "bold 50px Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = color;
    ctx.shadowBlur = 35;
    ctx.fillText("STATUS HUNTER", W/2, 100);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px Arial";
    ctx.fillText(userName, W/2, 145);

    const boxY = 200;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.shadowColor = color;
    ctx.shadowBlur = 25;
    ctx.strokeRect(W/2 - 230, boxY, 460, 100);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(W/2 - 230, boxY, 460, 100);

    ctx.fillStyle = "#aaaaaa";
    ctx.font = "18px Arial";
    ctx.fillText("Global System", W/2, boxY + 30);

    ctx.fillStyle = color;
    ctx.font = "bold 72px monospace";
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.fillText(globalPrefix, W/2, boxY + 80);
    ctx.shadowBlur = 0;

    const boxY2 = 320;
    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 4;
    ctx.shadowColor = "#00ff88";
    ctx.shadowBlur = 25;
    ctx.strokeRect(W/2 - 230, boxY2, 460, 100);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(W/2 - 230, boxY2, 460, 100);

    ctx.fillStyle = "#aaaaaa";
    ctx.font = "18px Arial";
    ctx.fillText("This Dungeon", W/2, boxY2 + 30);

    ctx.fillStyle = "#00ff88";
    ctx.font = "bold 72px monospace";
    ctx.shadowColor = "#00ff88";
    ctx.shadowBlur = 20;
    ctx.fillText(threadPrefix, W/2, boxY2 + 80);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(0, 212, 255, 0.9)";
    ctx.font = "14px Arial";
    ctx.textAlign = "right";
    ctx.fillText("Shadow Monarch v3.1", W - 20, H - 15);

    encoder.addFrame(ctx);
  }

  encoder.finish();
  await new Promise(resolve => setTimeout(resolve, 800));
  return outPath;
}

const { utils } = global;

module.exports = {
  config: {
    name: "prefix",
    version: "3.1",
    author: "NTKhang & Christus",
    countDown: 2,
    role: 0,
    description: "Change prefix avec GIF Solo Leveling + Status Hunter",
    category: "config",
    guide: {
      en: "{pn} <new prefix>: change prefix groupe\n{pn} <new prefix> -g: change prefix global\n{pn} reset: reset prefix\n{pn}: show status GIF"
    }
  },

  langs: {
    en: {
      reset: "✓ Prefix reset to default: %1",
      onlyAdmin: "❌ Only Shadow Monarch can change global prefix",
      confirmGlobal: "⚡ React to confirm SYSTEM UPDATE for all servers",
      confirmThisThread: "⚔️ React to confirm DUNGEON CLEAR for this group",
      successGlobal: "SYSTEM UPDATE COMPLETE\nNew global prefix: %1",
      successThisThread: "DUNGEON CLEARED\nNew group prefix: %1",
      myPrefix: "👋 Hunter %1\n➥ 🌐 Global: %2\n➥ 💬 This Dungeon: %3\nShadow Monarch at your service 🫡"
    }
  },

  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
    if (!args[0]) {
      return message.SyntaxError();
    }

    if (args[0] === "reset") {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.GoatBot.config.prefix));
    }

    const newPrefix = args[0];
    const formSet = {
      commandName,
      author: event.senderID,
      newPrefix
    };

    if (args[1] === "-g") {
      if (role < 2) {
        return message.reply(getLang("onlyAdmin"));
      } else {
        formSet.setGlobal = true;
      }
    } else {
      formSet.setGlobal = false;
    }

    return message.reply(args[1] === "-g"? getLang("confirmGlobal") : getLang("confirmThisThread"), (err, info) => {
      formSet.messageID = info.messageID;
      global.GoatBot.onReaction.set(info.messageID, formSet);
    });
  },

  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    const { author, newPrefix, setGlobal } = Reaction;
    if (event.userID!== author) {
      return;
    }

    const threadData = await threadsData.get(event.threadID);
    const threadName = threadData?.threadName || "Unknown Dungeon";

    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));

      try {
        await message.reply("⚙️ Initialisation du prefix en cours.");
        const gifPath = await generatePrefixGif(newPrefix, null, "global");
        return message.reply({
          body: getLang("successGlobal", newPrefix),
          attachment: fs.createReadStream(gifPath)
        }, () => {
          try { fs.removeSync(gifPath); } catch (e) {}
        });
      } catch (err) {
        console.error(err);
        return message.reply(getLang("successGlobal", newPrefix));
      }
    } else {
      await threadsData.set(event.threadID, newPrefix, "data.prefix");

      try {
        await message.reply("⚙️ Nettoyage du donjon en cours...");
        const gifPath = await generatePrefixGif(newPrefix, threadName, "local");
        return message.reply({
          body: getLang("successThisThread", newPrefix),
          attachment: fs.createReadStream(gifPath)
        }, () => {
          try { fs.removeSync(gifPath); } catch (e) {}
        });
      } catch (err) {
        console.error(err);
        return message.reply(getLang("successThisThread", newPrefix));
      }
    }
  },

  onChat: async function ({ event, message, getLang, usersData }) {
    if (event.body && event.body.toLowerCase() === "prefix") {
      const userName = await usersData.getName(event.senderID);
      const botName = global.GoatBot.config.nickNameBot || "Bot";
      const globalPrefix = global.GoatBot.config.prefix;
      const threadPrefix = utils.getPrefix(event.threadID);

      try {
        await message.reply("veuillez patienter...");
        const gifPath = await generateStatusGif(globalPrefix, threadPrefix, userName);
        return message.reply({
          body: getLang("myPrefix", userName, globalPrefix, threadPrefix, botName),
          attachment: fs.createReadStream(gifPath)
        }, () => {
          try { fs.removeSync(gifPath); } catch (e) {}
        });
      } catch (err) {
        console.error(err);
        return message.reply(getLang("myPrefix", userName, globalPrefix, threadPrefix, botName));
      }
    }
  }
};
