const { cmd } = require("../command");

cmd(
  {
    pattern: "links",
    alias: ["channel", "group", "join"],
    react: "🔗",
    desc: "Get WhatsApp Channel and Group links",
    category: "info",
    filename: __filename,
  },
  async (robin, mek, m, { from, reply, pushname }) => {
    try {
      const linksMsg = `🔗 *🌀ONYX MD🔥 LINKS* 🔗

📢 *WhatsApp Channel:*
https://whatsapp.com/channel/0029VaARQM6G3R3bdsoX8U0s

👥 *WhatsApp Group:*
https://chat.whatsapp.com/EakzHLdzYkn8dpflSMqYr1?mode=r_t

📋 *What you'll get:*
• Latest bot updates
• New features announcements
• Community support
• Tips and tricks
• Direct contact with developers

💡 *How to join:*
1. Click on the channel link to follow
2. Click on the group link to join
3. Stay connected for updates!

> *Made with ❤️ by Arosh Samuditha*`;

      await robin.sendMessage(from, {
        text: linksMsg
      });

    } catch (error) {
      console.error("Links plugin error:", error);
      reply("❌ Failed to send links. Please try again.");
    }
  }
); 