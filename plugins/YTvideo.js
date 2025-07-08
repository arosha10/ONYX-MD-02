const { cmd, commands } = require("../command");
const yts = require("yt-search");
const { ytmp4 } = require("@vreden/youtube_scraper");

const normalizeYouTubeUrl = (inputUrl) => {
  try {
    let urlObj = new URL(inputUrl);
    let videoId = null;
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.endsWith('youtube.com')) {
      if (urlObj.pathname === '/watch') {
        videoId = urlObj.searchParams.get('v');
      } else if (urlObj.pathname.startsWith('/embed/')) {
        videoId = urlObj.pathname.split('/embed/')[1];
      } else if (urlObj.pathname.startsWith('/shorts/')) {
        videoId = urlObj.pathname.split('/shorts/')[1];
      }
    }
    if (videoId) {
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    return inputUrl; // fallback
  } catch {
    return inputUrl;
  }
};

cmd(
  {
    pattern: "video",
    react: "📽",
    desc: "Download Video",
    category: "download",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    {
      from,
      quoted,
      body,
      isCmd,
      command,
      args,
      q,
      isGroup,
      sender,
      senderNumber,
      botNumber2,
      botNumber,
      pushname,
      isMe,
      isOwner,
      groupMetadata,
      groupName,
      participants,
      groupAdmins,
      isBotAdmins,
      isAdmins,
      reply,
    }
  ) => {
    try {
      if (!q) return reply("*නමක් හරි ලින්ක් එකක් හරි දෙන්න* 🫠");

      // Search for the video
      const search = await yts(q);
      if (!search.videos || search.videos.length === 0) {
        return reply("❌ No videos found for your search. Please try a different search term.");
      }
      
      const data = search.videos[0];
      const url = normalizeYouTubeUrl(data.url);

      // Video metadata description
      let desc = `
*🌀ONYX MD🔥VIDEO DOWNLOADER🌀*

🌀 *title* : ${data.title}
📄 *description* : ${data.description}
⏰ *time* : ${data.timestamp}
⭕ *ago* : ${data.ago}
👁 *views* : ${data.views}
⛓‍💥 *url* : ${data.url}

> *Made By Arosh Samuditha*
`;

      // Send metadata thumbnail message
      await robin.sendMessage(
        from,
        { image: { url: data.thumbnail }, caption: desc },
        { quoted: mek }
      );

      // Download the video using @vreden/youtube_scraper
      const quality = "128"; // Default quality
      const videoData = await ytmp4(url, quality);

      // Validate videoData structure
      if (!videoData || !videoData.download || !videoData.download.url) {
        console.error("Invalid videoData structure:", videoData);
        return reply("❌ Failed to get download URL. The video might be restricted or unavailable.");
      }

      // Validate video duration (limit: 30 minutes)
      let durationParts = data.timestamp.split(":").map(Number);
      let totalSeconds =
        durationParts.length === 3
          ? durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2]
          : durationParts[0] * 60 + durationParts[1];

      if (totalSeconds > 1800) {
        return reply("⏱️ video limit is 30 minitues");
      }

      // Send video file
      try {
        await robin.sendMessage(
          from,
          {
            video: { url: videoData.download.url },
            mimetype: "video/mp4",
            caption: "*🌀ONYX MD🔥BY AROSH🌀*",
          },
          { quoted: mek }
        );
      } catch (videoError) {
        console.error("Failed to send video:", videoError.message);
        return reply("❌ Failed to send video file. Please try again.");
      }

      // Send as a document (optional)
      try {
        await robin.sendMessage(
          from,
          {
            document: { url: videoData.download.url },
            mimetype: "video/mp4",
            fileName: `${data.title}.mp4`,
            caption: "*🌀ONYX MD🔥BY AROSH🌀*",
          },
          { quoted: mek }
        );
      } catch (docError) {
        console.error("Failed to send document:", docError.message);
        // Don't return here, just log the error
      }

      return reply("> *Thanks for using 🌀ONYX MD🔥*");
    } catch (e) {
      console.error("YTvideo plugin error:", e);
      
      // Provide more specific error messages
      if (e.message.includes("No videos found")) {
        reply("❌ No videos found for your search. Please try a different search term.");
      } else if (e.message.includes("download")) {
        reply("❌ Failed to download the video. The video might be restricted or unavailable.");
      } else if (e.message.includes("network")) {
        reply("❌ Network error. Please check your internet connection and try again.");
      } else {
        reply(`❌ Error: ${e.message || "Unknown error occurred"}`);
      }
    }
  }
);
