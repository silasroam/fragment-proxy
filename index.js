module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ status: "ERROR", message: "No username provided" });
  }

  const url = `https://fragment.com{username}`;

  try {
    // Используем встроенный бесплатный fetch вместо axios
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });

    const html = await response.text();
    let resultStatus = "UNKNOWN";

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
    return res.status(200).json({ username, status: "VERCEL_TIMEOUT_OR_BLOCKED" });
  }
};
