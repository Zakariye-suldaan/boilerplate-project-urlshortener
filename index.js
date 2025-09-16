require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const urlParser = require('url');
const app = express();

const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Static
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// In-memory database
let urls = [];
let counter = 1;

// POST URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  try {
    const parsedUrl = urlParser.parse(originalUrl);

    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      } else {
        const shortUrl = counter++;
        urls[shortUrl] = originalUrl;
        return res.json({ original_url: originalUrl, short_url: shortUrl });
      }
    });
  } catch {
    return res.json({ error: 'invalid url' });
  }
});

// Redirect by short_url
app.get('/api/shorturl/:id', (req, res) => {
  const id = req.params.id;
  const originalUrl = urls[id];
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found' });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
