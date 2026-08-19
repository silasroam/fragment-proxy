module.exports = async (req, res) => {
  // Разрешаем запросы (CORS) и принудительно ставим заголовок JSON
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { username } = req.query;

  if (!username) {
    return res.end(JSON.stringify({ status: "ERROR", message: "No username provided" }));
  }

  const url = `https://fragment.com{username}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    const html = await response.text();
    let resultStatus = "UNKNOWN";

    // Сверяем статус на Fragment
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

    // Принудительно отправляем как чистую строку JSON через res.end
    return res.end(JSON.stringify({ username: username, status: resultStatus }));

  } catch (error) {
    return res.end(JSON.stringify({ username: username, status: "VERCEL_TIMEOUT_OR_BLOCKED" }));
  }
};
