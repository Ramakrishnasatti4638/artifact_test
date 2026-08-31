const shortid = require('shortid');
const validator = require('validator');
const db = require('../db');

const isValidUrl = (url) => {
  try {
    return validator.isURL(url, { protocols: ['http', 'https'] });
  } catch {
    return false;
  }
};

const createShortUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const shortCode = shortid.generate();

    await db.run(
      'INSERT INTO urls (shortCode, originalUrl) VALUES (?, ?)',
      [shortCode, originalUrl]
    );

    const shortenedUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/${shortCode}`;

    res.status(201).json({
      originalUrl,
      shortCode,
      shortenedUrl,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ error: 'Failed to create short URL' });
  }
};

const getAllUrls = async (req, res) => {
  try {
    const urls = await db.all('SELECT * FROM urls ORDER BY createdAt DESC');
    res.json(urls);
  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Failed to fetch URLs' });
  }
};

const deleteUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const result = await db.run(
      'DELETE FROM urls WHERE shortCode = ?',
      [shortCode]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'URL not found' });
    }

    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Error deleting URL:', error);
    res.status(500).json({ error: 'Failed to delete URL' });
  }
};

const getStats = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await db.get(
      'SELECT * FROM urls WHERE shortCode = ?',
      [shortCode]
    );

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    res.json({
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      createdAt: url.createdAt
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

module.exports = {
  createShortUrl,
  getAllUrls,
  deleteUrl,
  getStats
};
