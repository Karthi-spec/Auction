const express = require('express');
const { getDatabase } = require('../database/init');
const { validateBid, validateAuctionAction } = require('../middleware/validation');
const router = express.Router();

// Get current auction state
router.get('/state', (req, res) => {
  const db = getDatabase();
  
  // Get current auction session
  db.get(`SELECT * FROM auction_sessions ORDER BY created_at DESC LIMIT 1`, (err, session) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!session) {
      return res.json({
        session: null,
        currentPlayer: null,
        teams: [],
        players: [],
        bids: []
      });
    }
    
    // Get current player
    db.get(`SELECT * FROM players WHERE id = ?`, [session.current_player_id], (err, currentPlayer) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Get all teams with their current state
      db.all(`SELECT * FROM teams WHERE session_id = ? OR session_id IS NULL`, [session.id], (err, teams) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Get all players
        db.all(`SELECT * FROM players ORDER BY base_price DESC`, (err, players) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          
          // Get recent bids for current player
          db.all(`
            SELECT * FROM bids 
            WHERE session_id = ? AND player_id = ? 
            ORDER BY timestamp DESC LIMIT 10
          `, [session.id, session.current_player_id], (err, bids) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({
              session,
              currentPlayer,
              teams,
              players,
              bids
            });
          });
        });
      });
    });
  });
});

// Start new auction session
router.post('/start', (req, res) => {
  const { name } = req.body;
  const db = getDatabase();
  
  db.run(`
    INSERT INTO auction_sessions (name, status) 
    VALUES (?, 'active')
  `, [name || 'IPL Auction'], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to start auction' });
    }
    
    const sessionId = this.lastID;
    
    // Update teams to link with this session
    db.run(`UPDATE teams SET session_id = ?`, [sessionId], (err) => {
      if (err) {
        console.error('Error linking teams to session:', err);
      }
      
      res.json({ 
        success: true, 
        sessionId,
        message: 'Auction started successfully' 
      });
    });
  });
});

// Set current player
router.post('/set-player', validateAuctionAction, (req, res) => {
  const { playerId, sessionId } = req.body;
  const db = getDatabase();
  
  db.run(`
    UPDATE auction_sessions 
    SET current_player_id = ?, current_bid = 0, current_bidder = NULL, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [playerId, sessionId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to set current player' });
    }
    
    // Get player details
    db.get(`SELECT * FROM players WHERE id = ?`, [playerId], (err, player) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to get player details' });
      }
      
      res.json({ 
        success: true, 
        player,
        message: 'Current player set successfully' 
      });
    });
  });
});

// Place bid
router.post('/bid', validateBid, (req, res) => {
  const { sessionId, playerId, teamName, amount, bidType = 'normal' } = req.body;
  const db = getDatabase();
  
  // Verify team has enough budget
  db.get(`SELECT remaining_budget FROM teams WHERE name = ?`, [teamName], (err, team) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!team || team.remaining_budget < amount) {
      return res.status(400).json({ error: 'Insufficient budget' });
    }
    
    // Insert bid
    db.run(`
      INSERT INTO bids (session_id, player_id, team_name, amount, bid_type) 
      VALUES (?, ?, ?, ?, ?)
    `, [sessionId, playerId, teamName, amount, bidType], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to place bid' });
      }
      
      // Update current bid in session
      db.run(`
        UPDATE auction_sessions 
        SET current_bid = ?, current_bidder = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [amount, teamName, sessionId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to update session' });
        }
        
        res.json({ 
          success: true, 
          bidId: this.lastID,
          message: 'Bid placed successfully' 
        });
      });
    });
  });
});

// Sell player
router.post('/sell', validateAuctionAction, (req, res) => {
  const { sessionId, playerId, teamName, amount } = req.body;
  const db = getDatabase();
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Update player as sold
    db.run(`
      UPDATE players 
      SET status = 'sold', sold_to = ?, sold_price = ? 
      WHERE id = ?
    `, [teamName, amount, playerId], (err) => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Failed to sell player' });
      }
    });
    
    // Update team budget and player count
    db.run(`
      UPDATE teams 
      SET remaining_budget = remaining_budget - ?, players_count = players_count + 1 
      WHERE name = ?
    `, [amount, teamName], (err) => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Failed to update team budget' });
      }
    });
    
    // Clear current player from session
    db.run(`
      UPDATE auction_sessions 
      SET current_player_id = NULL, current_bid = 0, current_bidder = NULL 
      WHERE id = ?
    `, [sessionId], (err) => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Failed to update session' });
      }
      
      db.run('COMMIT', (err) => {
        if (err) {
          return res.status(500).json({ error: 'Transaction failed' });
        }
        
        res.json({ 
          success: true, 
          message: 'Player sold successfully' 
        });
      });
    });
  });
});

// Mark player as unsold
router.post('/unsold', validateAuctionAction, (req, res) => {
  const { sessionId, playerId } = req.body;
  const db = getDatabase();
  
  db.run(`
    UPDATE players 
    SET status = 'unsold' 
    WHERE id = ?
  `, [playerId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to mark player as unsold' });
    }
    
    // Clear current player from session
    db.run(`
      UPDATE auction_sessions 
      SET current_player_id = NULL, current_bid = 0, current_bidder = NULL 
      WHERE id = ?
    `, [sessionId], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to update session' });
      }
      
      res.json({ 
        success: true, 
        message: 'Player marked as unsold' 
      });
    });
  });
});

// End auction
router.post('/end', (req, res) => {
  const { sessionId } = req.body;
  const db = getDatabase();
  
  db.run(`
    UPDATE auction_sessions 
    SET status = 'completed', updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [sessionId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to end auction' });
    }
    
    res.json({ 
      success: true, 
      message: 'Auction ended successfully' 
    });
  });
});

// Get auction statistics
router.get('/stats', (req, res) => {
  const db = getDatabase();
  
  db.get(`SELECT * FROM auction_sessions ORDER BY created_at DESC LIMIT 1`, (err, session) => {
    if (err || !session) {
      return res.status(500).json({ error: 'No active session found' });
    }
    
    // Get various statistics
    const queries = [
      { key: 'totalPlayers', sql: 'SELECT COUNT(*) as count FROM players' },
      { key: 'soldPlayers', sql: 'SELECT COUNT(*) as count FROM players WHERE status = "sold"' },
      { key: 'unsoldPlayers', sql: 'SELECT COUNT(*) as count FROM players WHERE status = "unsold"' },
      { key: 'totalBids', sql: 'SELECT COUNT(*) as count FROM bids WHERE session_id = ?' },
      { key: 'totalSpent', sql: 'SELECT SUM(sold_price) as total FROM players WHERE status = "sold"' }
    ];
    
    const stats = {};
    let completed = 0;
    
    queries.forEach(({ key, sql }) => {
      const params = sql.includes('session_id') ? [session.id] : [];
      db.get(sql, params, (err, result) => {
        if (!err) {
          stats[key] = result.count || result.total || 0;
        }
        completed++;
        
        if (completed === queries.length) {
          res.json({ session, stats });
        }
      });
    });
  });
});

module.exports = router;