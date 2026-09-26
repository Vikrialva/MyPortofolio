'use strict';

const crypto = require('node:crypto');
const { documents } = require('./db');

function scryptHash(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16);
    crypto.scrypt(password, salt, 64, (err, derived) => {
      if (err) return reject(err);
      resolve(salt.toString('hex') + ':' + derived.toString('hex'));
    });
  });
}

function scryptVerify(password, hash) {
  return new Promise((resolve, reject) => {
    if (!hash || !password) return resolve(false);
    const [saltHex, keyHex] = hash.split(':');
    if (!saltHex || !keyHex) return resolve(false);
    const salt = Buffer.from(saltHex, 'hex');
    const key = Buffer.from(keyHex, 'hex');
    crypto.scrypt(password, salt, 64, (err, derived) => {
      if (err) return reject(err);
      resolve(crypto.timingSafeEqual(key, derived));
    });
  });
}

async function ensureAdminUser() {
  const { users } = require('./db');
  if (users.count() === 0) {
    const pass = process.env.ADMIN_PASSWORD || 'admin123';
    users.create(process.env.ADMIN_USER || 'admin', await scryptHash(pass));
  }
}

function requireAuth(req, res, next) {
  if (req.user) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

function contentHelpers() {
  return {
    getText(docName, key, fallback = '') {
      const d = documents.get(docName);
      const en = d?.en || {};
      const id = d?.id || {};
      if (id[key]) return id[key];
      if (en[key]) return en[key];
      return fallback;
    }
  };
}

module.exports = { scryptHash, scryptVerify, ensureAdminUser, requireAuth, contentHelpers };
