const db = require('../db');

const redirect = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await db.get(
      'SELECT * FROM urls WHERE shortCode = ?',
      [shortCode]
    );

    if (!url) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Increment click count
    await db.run(
      'UPDATE urls SET clicks = clicks + 1 WHERE shortCode = ?',
      [shortCode]
    );

    res.redirect(url.originalUrl);
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ error: 'Redirect failed' });
  }
};

module.exports = {
  redirect
};
