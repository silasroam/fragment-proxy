const axios = require('axios');

module.exports = async (req, res) => {
  // Разрешаем запросы с любых адресов (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ status: "ERROR", message: "No username provided" });
  }

  const url = `https://fragment.com{username}`;

  try {
    // Делаем запрос к Fragment, маскируясь под реальный браузер
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    const html = response.data;
    let resultStatus = "UNKNOWN";

    // Умный поиск статуса в HTML коде Fragment
    if (html.includes('tm-section-header-status')) {
      if (html.includes('Available')) {
        resultStatus = "AVAILABLE";
      } else if (html.includes('Taken')) {
        resultStatus = "TAKEN";
      } else if (html.includes('Auction')) {
        resultStatus = "AUCTION";
      } else if (html.includes('Sold')) {
        resultStatus = "SOLD";
      }
    } else {
      resultStatus = "NOT_FOUND";
    }

    return res.status(200).json({ username, status: resultStatus });

  } catch (error) {
    // Если Cloudflare всё-таки вернул 403/429 или лег таймаут
    return res.status(200).json({ username, status: "VERCEL_TIMEOUT_OR_BLOCKED" });
  }
};
