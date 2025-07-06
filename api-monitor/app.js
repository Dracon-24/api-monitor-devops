const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

// URLs to monitor
const urls = [
  "https://api.github.com",
  "https://openai.com",
  "http://localhost:5000" // (for simulating up/down locally)
];

let statusMap = {
  "https://api.github.com": {
    status: "UP",
    latency: "123ms"
  }
};

let logData = [
  {
    url: "https://api.github.com",
    status: "UP",
    latency: "123ms",
    timestamp: new Date().toISOString()
  }
];

// Function to check API status
const checkWebsites = async () => {
  for (const url of urls) {
    const start = Date.now();
    try {
      await axios.get(url);
      const latency = Date.now() - start;
      statusMap[url] = { status: "UP", latency: `${latency}ms` };
      logData.push({
        url,
        status: "UP",
        latency: `${latency}ms`,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      statusMap[url] = { status: "DOWN", latency: null };
      logData.push({
        url,
        status: "DOWN",
        latency: null,
        timestamp: new Date().toISOString()
      });
    }
  }
};

// ✅ Only run interval & initial check if NOT in test mode
if (process.env.NODE_ENV !== "test") {
  setInterval(checkWebsites, 60 * 1000); // Check every 60 seconds
  checkWebsites(); // Initial run
}

// Routes
app.get("/status", (req, res) => {
  res.json(Object.entries(statusMap).map(([url, info]) => ({ url, ...info })));
});

app.get("/logs", (req, res) => {
  res.json(logData.slice(-50)); // return last 50 logs
});

app.get("/", (req, res) => {
  res.send(`
    <h2> Welcome to API Uptime Monitor</h2>
    <p>Available endpoints:</p>
    <ul>
      <li><a href="/status">/status</a> - View current API status</li>
      <li><a href="/logs">/logs</a> - View uptime logs</li>
    </ul>
  `);
});


if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API Uptime Monitor running at http://localhost:${PORT}`);
  });
}

module.exports = app;

