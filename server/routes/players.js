const express = require('express');
const { getDatabase } = require('../database/init');
const router = express.Router();

// Get all players
router.get('/', (req, res) => {
  const { status, role, team, limit = 50, offset = 0 } = req.query;
  const db = getDatabase();
  
  let sql = 'SELECT * FROM players WHERE 1=1';
  const params = [];
  
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  
  if (role) {
    sql += ' AND role = ?';
    params.push(role);
  }
  
  if (team) {
    sql += ' AND team = ?';
    params.push(team);
  }
  
  sql += ' ORDER BY base_price DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(sql, params, (err, players) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) as total FROM players WHERE 1=1';
    const countParams = [];
    
    if (status) {
      countSql += ' AND status = ?';
      countParams.push(status);
    }
    
    if (role) {
      countSql += ' AND role = ?';
      countParams.push(role);
    }
    
    if (team) {
      countSql += ' AND team = ?';
      countParams.push(team);
    }
    
    db.get(countSql, countParams, (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        players,
        pagination: {
          total: countResult.total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < countResult.total
        }
      });
    });
  });
});

// Get player by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  db.get('SELECT * FROM players WHERE id = ?', [id], (err, player) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    // Get player's bid history
    db.all(`
      SELECT b.*, a.name as session_name 
      FROM bids b 
      JOIN auction_sessions a ON b.session_id = a.id 
      WHERE b.player_id = ? 
      ORDER BY b.timestamp DESC
    `, [id], (err, bids) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        player,
        bidHistory: bids
      });
    });
  });
});

// Add new player
router.post('/', (req, res) => {
  const {
    name, team, role, battingStyle, bowlingStyle, basePrice,
    photoUrl, videoUrl, ratingBatting, ratingBowling, ratingFielding, ratingOverall
  } = req.body;
  
  if (!name || !role || !basePrice) {
    return res.status(400).json({ error: 'Name, role, and base price are required' });
  }
  
  const db = getDatabase();
  
  db.run(`
    INSERT INTO players (
      name, team, role, batting_style, bowling_style, base_price,
      photo_url, video_url, rating_batting, rating_bowling, rating_fielding, rating_overall
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    name, team, role, battingStyle, bowlingStyle, basePrice,
    photoUrl, videoUrl, ratingBatting || 50, ratingBowling || 50, 
    ratingFielding || 50, ratingOverall || 50
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to add player' });
    }
    
    // Get the created player
    db.get('SELECT * FROM players WHERE id = ?', [this.lastID], (err, player) => {
      if (err) {
        return res.status(500).json({ error: 'Player added but failed to retrieve' });
      }
      
      res.status(201).json({
        success: true,
        player,
        message: 'Player added successfully'
      });
    });
  });
});

// Update player
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // Remove id from updates if present
  delete updates.id;
  delete updates.created_at;
  
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }
  
  const db = getDatabase();
  
  // Build dynamic update query
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  
  db.run(`UPDATE players SET ${setClause} WHERE id = ?`, [...values, id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update player' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    // Get updated player
    db.get('SELECT * FROM players WHERE id = ?', [id], (err, player) => {
      if (err) {
        return res.status(500).json({ error: 'Player updated but failed to retrieve' });
      }
      
      res.json({
        success: true,
        player,
        message: 'Player updated successfully'
      });
    });
  });
});

// Delete player
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  // Check if player is in an active auction
  db.get(`
    SELECT p.*, a.status 
    FROM players p 
    LEFT JOIN auction_sessions a ON a.current_player_id = p.id 
    WHERE p.id = ? AND a.status = 'active'
  `, [id], (err, activePlayer) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (activePlayer) {
      return res.status(400).json({ error: 'Cannot delete player in active auction' });
    }
    
    db.run('DELETE FROM players WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete player' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Player not found' });
      }
      
      res.json({
        success: true,
        message: 'Player deleted successfully'
      });
    });
  });
});

// Get players by role
router.get('/role/:role', (req, res) => {
  const { role } = req.params;
  const db = getDatabase();
  
  db.all('SELECT * FROM players WHERE role = ? ORDER BY base_price DESC', [role], (err, players) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ players });
  });
});

// Search players
router.get('/search/:query', (req, res) => {
  const { query } = req.params;
  const { limit = 20 } = req.query;
  const db = getDatabase();
  
  db.all(`
    SELECT * FROM players 
    WHERE name LIKE ? OR team LIKE ? OR role LIKE ?
    ORDER BY base_price DESC 
    LIMIT ?
  `, [`%${query}%`, `%${query}%`, `%${query}%`, parseInt(limit)], (err, players) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ players, query });
  });
});

module.exports = router;