const express = require('express');
const { getDatabase } = require('../database/init');
const router = express.Router();

// Get all teams
router.get('/', (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT * FROM teams ORDER BY name', (err, teams) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Get player count for each team
    const teamsWithPlayers = [];
    let completed = 0;
    
    if (teams.length === 0) {
      return res.json({ teams: [] });
    }
    
    teams.forEach(team => {
      db.all('SELECT * FROM players WHERE sold_to = ?', [team.name], (err, players) => {
        if (!err) {
          team.players = players;
          team.actualPlayersCount = players.length;
        } else {
          team.players = [];
          team.actualPlayersCount = 0;
        }
        
        teamsWithPlayers.push(team);
        completed++;
        
        if (completed === teams.length) {
          res.json({ teams: teamsWithPlayers });
        }
      });
    });
  });
});

// Get team by name
router.get('/:name', (req, res) => {
  const { name } = req.params;
  const db = getDatabase();
  
  db.get('SELECT * FROM teams WHERE name = ?', [name], (err, team) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Get team's players
    db.all('SELECT * FROM players WHERE sold_to = ? ORDER BY sold_price DESC', [name], (err, players) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Get team's bid history
      db.all(`
        SELECT b.*, p.name as player_name, p.role as player_role
        FROM bids b 
        JOIN players p ON b.player_id = p.id 
        WHERE b.team_name = ? 
        ORDER BY b.timestamp DESC
      `, [name], (err, bidHistory) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Calculate team statistics
        const stats = {
          totalSpent: players.reduce((sum, player) => sum + (player.sold_price || 0), 0),
          remainingBudget: team.remaining_budget,
          playersCount: players.length,
          maxPlayers: team.max_players,
          averagePlayerPrice: players.length > 0 ? 
            players.reduce((sum, player) => sum + (player.sold_price || 0), 0) / players.length : 0,
          roleDistribution: players.reduce((acc, player) => {
            acc[player.role] = (acc[player.role] || 0) + 1;
            return acc;
          }, {})
        };
        
        res.json({
          team,
          players,
          bidHistory,
          stats
        });
      });
    });
  });
});

// Update team budget
router.put('/:name/budget', (req, res) => {
  const { name } = req.params;
  const { budget } = req.body;
  
  if (!budget || budget < 0) {
    return res.status(400).json({ error: 'Valid budget amount required' });
  }
  
  const db = getDatabase();
  
  db.run(`
    UPDATE teams 
    SET budget = ?, remaining_budget = ? 
    WHERE name = ?
  `, [budget, budget, name], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update team budget' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    res.json({
      success: true,
      message: 'Team budget updated successfully'
    });
  });
});

// Reset team (remove all players and reset budget)
router.post('/:name/reset', (req, res) => {
  const { name } = req.params;
  const db = getDatabase();
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Get original budget
    db.get('SELECT budget FROM teams WHERE name = ?', [name], (err, team) => {
      if (err || !team) {
        db.run('ROLLBACK');
        return res.status(404).json({ error: 'Team not found' });
      }
      
      // Remove players from team (mark as available)
      db.run(`
        UPDATE players 
        SET status = 'available', sold_to = NULL, sold_price = NULL 
        WHERE sold_to = ?
      `, [name], (err) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Failed to reset players' });
        }
        
        // Reset team budget and player count
        db.run(`
          UPDATE teams 
          SET remaining_budget = ?, players_count = 0 
          WHERE name = ?
        `, [team.budget, name], (err) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Failed to reset team budget' });
          }
          
          db.run('COMMIT', (err) => {
            if (err) {
              return res.status(500).json({ error: 'Transaction failed' });
            }
            
            res.json({
              success: true,
              message: 'Team reset successfully'
            });
          });
        });
      });
    });
  });
});

// Get team analysis
router.get('/:name/analysis', (req, res) => {
  const { name } = req.params;
  const db = getDatabase();
  
  db.get('SELECT * FROM teams WHERE name = ?', [name], (err, team) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Get team's players with detailed analysis
    db.all(`
      SELECT *, 
        CASE 
          WHEN role = 'Batsman' THEN rating_batting
          WHEN role = 'Bowler' THEN rating_bowling
          WHEN role = 'All-rounder' THEN (rating_batting + rating_bowling) / 2
          WHEN role = 'Wicket-keeper' THEN (rating_batting + rating_fielding) / 2
          ELSE rating_overall
        END as role_rating
      FROM players 
      WHERE sold_to = ? 
      ORDER BY sold_price DESC
    `, [name], (err, players) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Calculate comprehensive team analysis
      const analysis = {
        teamStrength: {
          batting: players.reduce((sum, p) => sum + p.rating_batting, 0) / Math.max(players.length, 1),
          bowling: players.reduce((sum, p) => sum + p.rating_bowling, 0) / Math.max(players.length, 1),
          fielding: players.reduce((sum, p) => sum + p.rating_fielding, 0) / Math.max(players.length, 1),
          overall: players.reduce((sum, p) => sum + p.rating_overall, 0) / Math.max(players.length, 1)
        },
        roleBalance: players.reduce((acc, player) => {
          acc[player.role] = (acc[player.role] || 0) + 1;
          return acc;
        }, {}),
        budgetUtilization: {
          spent: team.budget - team.remaining_budget,
          remaining: team.remaining_budget,
          percentage: ((team.budget - team.remaining_budget) / team.budget) * 100
        },
        topPlayers: players.slice(0, 5),
        weaknesses: [],
        strengths: []
      };
      
      // Identify strengths and weaknesses
      if (analysis.teamStrength.batting > 75) analysis.strengths.push('Strong batting lineup');
      if (analysis.teamStrength.bowling > 75) analysis.strengths.push('Excellent bowling attack');
      if (analysis.teamStrength.fielding > 75) analysis.strengths.push('Great fielding unit');
      
      if (analysis.teamStrength.batting < 50) analysis.weaknesses.push('Weak batting lineup');
      if (analysis.teamStrength.bowling < 50) analysis.weaknesses.push('Poor bowling attack');
      if (!analysis.roleBalance['Wicket-keeper']) analysis.weaknesses.push('No wicket-keeper');
      if ((analysis.roleBalance['All-rounder'] || 0) < 2) analysis.weaknesses.push('Lack of all-rounders');
      
      res.json({
        team,
        players,
        analysis
      });
    });
  });
});

// Get team comparison
router.get('/compare/:team1/:team2', (req, res) => {
  const { team1, team2 } = req.params;
  const db = getDatabase();
  
  const getTeamData = (teamName) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM teams WHERE name = ?', [teamName], (err, team) => {
        if (err) return reject(err);
        if (!team) return reject(new Error('Team not found'));
        
        db.all('SELECT * FROM players WHERE sold_to = ?', [teamName], (err, players) => {
          if (err) return reject(err);
          
          const stats = {
            batting: players.reduce((sum, p) => sum + p.rating_batting, 0) / Math.max(players.length, 1),
            bowling: players.reduce((sum, p) => sum + p.rating_bowling, 0) / Math.max(players.length, 1),
            fielding: players.reduce((sum, p) => sum + p.rating_fielding, 0) / Math.max(players.length, 1),
            overall: players.reduce((sum, p) => sum + p.rating_overall, 0) / Math.max(players.length, 1),
            totalSpent: team.budget - team.remaining_budget,
            playersCount: players.length
          };
          
          resolve({ team, players, stats });
        });
      });
    });
  };
  
  Promise.all([getTeamData(team1), getTeamData(team2)])
    .then(([data1, data2]) => {
      const comparison = {
        team1: data1,
        team2: data2,
        winner: {
          batting: data1.stats.batting > data2.stats.batting ? team1 : team2,
          bowling: data1.stats.bowling > data2.stats.bowling ? team1 : team2,
          fielding: data1.stats.fielding > data2.stats.fielding ? team1 : team2,
          overall: data1.stats.overall > data2.stats.overall ? team1 : team2,
          budgetEfficiency: (data1.stats.overall / data1.stats.totalSpent) > (data2.stats.overall / data2.stats.totalSpent) ? team1 : team2
        }
      };
      
      res.json(comparison);
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

module.exports = router;