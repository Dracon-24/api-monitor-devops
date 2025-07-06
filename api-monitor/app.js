const express = require("express");
const axios = require("axios");
const graphite = require('graphite');
const client = graphite.createClient('plaintext://localhost:2003/');
const StatsD = require('node-statsd');
const statsd = new StatsD({
  host: 'graphite',
  port: 8125
});

const app = express();
const PORT = 4000;

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
app.get('/status', async (req, res) => {
  const start = Date.now();

  // Simulate or perform some real checks (e.g., DB ping, CPU load, etc.)
  try {
    // If you want, add logic here to check real services.

    const responseTime = Date.now() - start;

    // Send real metrics
    statsd.timing('uptime_monitor.response_time', responseTime);  // ms latency
    statsd.increment('uptime_monitor.status_requests');           // count hits

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
    });
  } catch (error) {
    statsd.increment('uptime_monitor.errors');  // track errors
    res.status(500).json({ status: 'error', error: error.message });
  }
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

