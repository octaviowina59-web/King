module.exports = {
  config: {
    name: "out",
    aliases: ["leave"],
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 3,
    shortDescription: {
      en: "Le bot quitte le groupe",
    },
    category: "owner",
    guide: {
      en: "{pn} — Faire quitter le bot de ce groupe"
    }
  },

  onStart: async function ({ api, event }) {
    try {

      await api.sendMessage(
        "😢 D'accord, je quitte ce groupe...\n💌 Prenez soin de vous tous 💖",
        event.threadID
      );

      setTimeout(() => {
        api.removeUserFromGroup(api.getCurrentUserID(), event.threadID);
      }, 500);
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Impossible de quitter le groupe.", event.threadID);
    }
  }
};
