const { cmd } = require("../command");
const axios = require("axios");
const cheerio = require("cheerio");

cmd(
  {
    pattern: "pin",
    alias: ["pinterest"],
    desc: "Download Pinterest video",
    category: "download",
    react: "📌",
    filename: __filename,
  },
  async (robin, mek, m, { reply, q }) => {
    if (!q) return reply("❌ Please provide a Pinterest video URL.");
    if (!q.includes("pinterest.com")) return reply("❌ Invalid Pinterest URL.");

    try {
      reply("*Downloading your Pinterest video...* 📌");

      // Extract video URL from Pinterest
      const response = await axios.get(q, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Look for video sources in the page
      let videoUrl = null;
      
      // Method 1: Look for video tags
      $('video source').each((i, elem) => {
        const src = $(elem).attr('src');
        if (src && src.includes('pinimg.com')) {
          videoUrl = src;
          return false; // break the loop
        }
      });

      // Method 2: Look for video URLs in script tags
      if (!videoUrl) {
        $('script').each((i, elem) => {
          const content = $(elem).html();
          if (content) {
            const videoMatch = content.match(/"video":{"url":"([^"]+)"/);
            if (videoMatch) {
              videoUrl = videoMatch[1].replace(/\\/g, '');
              return false;
            }
          }
        });
      }

      // Method 3: Look for JSON-LD structured data
      if (!videoUrl) {
        $('script[type="application/ld+json"]').each((i, elem) => {
          try {
            const jsonData = JSON.parse($(elem).html());
            if (jsonData.contentUrl && jsonData.contentUrl.includes('pinimg.com')) {
              videoUrl = jsonData.contentUrl;
              return false;
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        });
      }

      // Method 4: Look for og:video meta tags
      if (!videoUrl) {
        const ogVideo = $('meta[property="og:video"]').attr('content');
        if (ogVideo && ogVideo.includes('pinimg.com')) {
          videoUrl = ogVideo;
        }
      }

      if (!videoUrl) {
        return reply("❌ Could not extract video URL from Pinterest. The video might be private or not available.");
      }

      // Get the title/description
      const title = $('meta[property="og:title"]').attr('content') || 
                   $('meta[name="description"]').attr('content') || 
                   "Pinterest Video";

      // Send the video
      await robin.sendFileUrl(
        mek.key.remoteJid,
        videoUrl,
        `📌 *Pinterest Video*\n\n📄 *Title*: ${title}\n\n> *Thanks for using 🌀ONYX MD🔥*`,
        mek
      );

    } catch (err) {
      console.error("Pinterest download error:", err);
      reply("❌ Failed to download video. Please check the link and try again.");
    }
  }
); 