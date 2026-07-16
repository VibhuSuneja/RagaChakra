/**
 * middleware/dbGuard.js
 * Rejects requests gracefully when MongoDB is not connected.
 * Prevents hanging connections on routes that require the DB.
 */

let dbConnected = false;

const setDbConnected = (state) => {
  dbConnected = state;
};

const requireDb = (req, res, next) => {
  if (!dbConnected) {
    return res.status(503).json({
      error: 'Database unavailable. The app is running in offline/demo mode.',
      offlineMode: true,
    });
  }
  next();
};

module.exports = { requireDb, setDbConnected, getDbConnected: () => dbConnected };
