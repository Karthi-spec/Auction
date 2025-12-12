const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;

const DB_PATH = path.join(__dirname, 'auction.db');

let db = null;

const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
      createTables().then(resolve).catch(reject);
    });
  });
};

const createTables = async () => {
  return new Promise((resolve, reject) => {
    const tables = [
      // Auction sessions table
      `CREATE TABLE IF NOT EXISTS auction_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'waiting',
        current_player_id INTEGER,
        current_bid INTEGER DEFAULT 0,
        current_bidder TEXT,
        timer_seconds INTEGER DEFAULT 30,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Players table
      `CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        team TEXT,
        role TEXT,
        batting_style TEXT,
        bowling_style TEXT,
        base_price INTEGER,
        photo_url TEXT,
        video_url TEXT,
        rating_batting INTEGER DEFAULT 0,
        rating_bowling INTEGER DEFAULT 0,
        rating_fielding INTEGER DEFAULT 0,
        rating_overall INTEGER DEFAULT 0,
        status TEXT DEFAULT 'available',
        sold_to TEXT,
        sold_price INTEGER,
        session_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES auction_sessions (id)
      )`,

      // Teams table
      `CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        short_name TEXT,
        logo_url TEXT,
        primary_color TEXT,
        secondary_color TEXT,
        budget INTEGER DEFAULT 100000000,
        remaining_budget INTEGER DEFAULT 100000000,
        players_count INTEGER DEFAULT 0,
        max_players INTEGER DEFAULT 25,
        session_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES auction_sessions (id)
      )`,

      // Bids table
      `CREATE TABLE IF NOT EXISTS bids (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER,
        player_id INTEGER,
        team_name TEXT,
        amount INTEGER,
        bid_type TEXT DEFAULT 'normal',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES auction_sessions (id),
        FOREIGN KEY (player_id) REFERENCES players (id)
      )`,

      // Connected clients table
      `CREATE TABLE IF NOT EXISTS connected_clients (
        id TEXT PRIMARY KEY,
        session_id INTEGER,
        team_name TEXT,
        role TEXT,
        connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES auction_sessions (id)
      )`,

      // Retention decisions table
      `CREATE TABLE IF NOT EXISTS retention_decisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER,
        team_name TEXT,
        player_id INTEGER,
        decision TEXT,
        amount INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES auction_sessions (id),
        FOREIGN KEY (player_id) REFERENCES players (id)
      )`
    ];

    let completed = 0;
    const total = tables.length;

    tables.forEach((sql, index) => {
      db.run(sql, (err) => {
        if (err) {
          console.error(`Error creating table ${index}:`, err);
          reject(err);
          return;
        }
        completed++;
        if (completed === total) {
          console.log('✅ All database tables created successfully');
          seedInitialData().then(resolve).catch(reject);
        }
      });
    });
  });
};

const seedInitialData = async () => {
  try {
    // Load players data
    const playersData = await fs.readFile(path.join(__dirname, '../../players.json'), 'utf8');
    const playersJson = JSON.parse(playersData);
    const players = playersJson.players || playersJson;

    // Load teams data
    const teamsData = await fs.readFile(path.join(__dirname, '../../teams.json'), 'utf8');
    const teamsJson = JSON.parse(teamsData);
    const teams = teamsJson.teams || teamsJson;

    // Load player ratings
    const ratingsData = await fs.readFile(path.join(__dirname, '../../data/playerRatings.json'), 'utf8');
    const ratings = JSON.parse(ratingsData);

    // Insert teams
    const insertTeam = `INSERT OR IGNORE INTO teams 
      (name, short_name, logo_url, primary_color, secondary_color) 
      VALUES (?, ?, ?, ?, ?)`;

    for (const team of teams) {
      await new Promise((resolve, reject) => {
        db.run(insertTeam, [
          team.name,
          team.shortName,
          team.logo || `/static/logos/${team.shortName}.png`, // Default logo path
          team.color || team.primaryColor || '#000000',
          team.secondaryColor || '#FFFFFF'
        ], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Insert players
    const insertPlayer = `INSERT OR IGNORE INTO players 
      (name, team, role, batting_style, bowling_style, base_price, photo_url, video_url, 
       rating_batting, rating_bowling, rating_fielding, rating_overall) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    for (const player of players) {
      const playerName = player.fullName || player.name || `${player.firstName} ${player.surname}`;
      const playerRating = ratings[playerName] || {
        batting: 50, bowling: 50, fielding: 50, overall: 50
      };

      await new Promise((resolve, reject) => {
        db.run(insertPlayer, [
          playerName,
          player.team || player.previousTeams?.[0] || null,
          player.specialism || player.role || 'All-rounder',
          player.battingStyle || 'Right-hand bat',
          player.bowlingStyle || 'Right-arm medium',
          player.basePrice || 1000000, // Default base price 10 lakhs
          player.photo || `/static/players/${playerName.replace(/\s+/g, '_')}.jpg`,
          player.video || `/static/videos/${playerName.replace(/\s+/g, '_')}.mp4`,
          playerRating.batting,
          playerRating.bowling,
          playerRating.fielding,
          playerRating.overall
        ], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    console.log('✅ Initial data seeded successfully');
    console.log(`📊 Inserted ${teams.length} teams and ${players.length} players`);

    // Insert default session
    await new Promise((resolve, reject) => {
      db.run("INSERT OR IGNORE INTO auction_sessions (id, name, status) VALUES (1, 'IPL Auction 2024', 'waiting')", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('✅ Default session seeded');

  } catch (error) {
    console.error('Error seeding initial data:', error);
    throw error;
  }
};

const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};

const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
};

module.exports = {
  initializeDatabase,
  getDatabase,
  closeDatabase
};