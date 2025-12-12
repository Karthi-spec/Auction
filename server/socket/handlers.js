const { getDatabase } = require('../database/init');

const connectedClients = new Map();
const auctionState = {
  currentPlayer: null,
  currentBid: 0,
  currentBidder: null,
  timer: 30,
  isActive: false,
  sessionId: null
};

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    
    // Handle client joining
    socket.on('join-auction', (data) => {
      const { role, teamName, sessionId } = data;
      
      connectedClients.set(socket.id, {
        role,
        teamName,
        sessionId,
        connectedAt: new Date(),
        lastSeen: new Date()
      });
      
      // Join room based on session
      socket.join(`session-${sessionId}`);
      
      // Update database
      const db = getDatabase();
      db.run(`
        INSERT OR REPLACE INTO connected_clients (id, session_id, team_name, role, last_seen) 
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [socket.id, sessionId, teamName, role]);
      
      // Broadcast updated connection stats
      broadcastConnectionStats(io, sessionId);
      
      // Send current auction state to new client
      socket.emit('auction-state', auctionState);
      
      console.log(`👤 ${role} joined${teamName ? ` as ${teamName}` : ''}`);
    });
    
    // Handle bidding
    socket.on('place-bid', (data) => {
      const client = connectedClients.get(socket.id);
      if (!client || client.role !== 'bidder') {
        socket.emit('error', { message: 'Unauthorized to bid' });
        return;
      }
      
      const { amount, playerId } = data;
      const { teamName, sessionId } = client;
      
      // Validate bid
      if (amount <= auctionState.currentBid) {
        socket.emit('error', { message: 'Bid must be higher than current bid' });
        return;
      }
      
      // Check team budget
      const db = getDatabase();
      db.get('SELECT remaining_budget FROM teams WHERE name = ?', [teamName], (err, team) => {
        if (err || !team || team.remaining_budget < amount) {
          socket.emit('error', { message: 'Insufficient budget' });
          return;
        }
        
        // Record bid in database
        db.run(`
          INSERT INTO bids (session_id, player_id, team_name, amount) 
          VALUES (?, ?, ?, ?)
        `, [sessionId, playerId, teamName, amount], function(err) {
          if (err) {
            socket.emit('error', { message: 'Failed to record bid' });
            return;
          }
          
          // Update auction state
          auctionState.currentBid = amount;
          auctionState.currentBidder = teamName;
          
          // Broadcast bid to all clients in session
          io.to(`session-${sessionId}`).emit('new-bid', {
            teamName,
            amount,
            playerId,
            timestamp: new Date()
          });
          
          // Reset timer
          resetAuctionTimer(io, sessionId);
          
          console.log(`💰 ${teamName} bid ₹${amount.toLocaleString()}`);
        });
      });
    });
    
    // Handle RTM (Right to Match)
    socket.on('use-rtm', (data) => {
      const client = connectedClients.get(socket.id);
      if (!client || client.role !== 'bidder') {
        socket.emit('error', { message: 'Unauthorized to use RTM' });
        return;
      }
      
      const { playerId, amount } = data;
      const { teamName, sessionId } = client;
      
      // Record RTM bid
      const db = getDatabase();
      db.run(`
        INSERT INTO bids (session_id, player_id, team_name, amount, bid_type) 
        VALUES (?, ?, ?, ?, 'rtm')
      `, [sessionId, playerId, teamName, amount], function(err) {
        if (err) {
          socket.emit('error', { message: 'Failed to record RTM' });
          return;
        }
        
        // Broadcast RTM to all clients
        io.to(`session-${sessionId}`).emit('rtm-used', {
          teamName,
          playerId,
          amount,
          timestamp: new Date()
        });
        
        console.log(`🎯 ${teamName} used RTM for ₹${amount.toLocaleString()}`);
      });
    });
    
    // Handle admin actions
    socket.on('admin-action', (data) => {
      const client = connectedClients.get(socket.id);
      if (!client || client.role !== 'admin') {
        socket.emit('error', { message: 'Unauthorized admin action' });
        return;
      }
      
      const { action, payload } = data;
      const { sessionId } = client;
      
      switch (action) {
        case 'set-player':
          setCurrentPlayer(io, sessionId, payload.playerId);
          break;
          
        case 'sell-player':
          sellPlayer(io, sessionId, payload);
          break;
          
        case 'mark-unsold':
          markPlayerUnsold(io, sessionId, payload.playerId);
          break;
          
        case 'start-timer':
          startAuctionTimer(io, sessionId);
          break;
          
        case 'pause-timer':
          pauseAuctionTimer(io, sessionId);
          break;
          
        case 'reset-timer':
          resetAuctionTimer(io, sessionId);
          break;
          
        default:
          socket.emit('error', { message: 'Unknown admin action' });
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      const client = connectedClients.get(socket.id);
      if (client) {
        const { sessionId } = client;
        
        // Remove from database
        const db = getDatabase();
        db.run('DELETE FROM connected_clients WHERE id = ?', [socket.id]);
        
        // Remove from memory
        connectedClients.delete(socket.id);
        
        // Broadcast updated connection stats
        broadcastConnectionStats(io, sessionId);
        
        console.log(`🔌 Client disconnected: ${socket.id}`);
      }
    });
    
    // Handle heartbeat
    socket.on('heartbeat', () => {
      const client = connectedClients.get(socket.id);
      if (client) {
        client.lastSeen = new Date();
        
        // Update database
        const db = getDatabase();
        db.run('UPDATE connected_clients SET last_seen = CURRENT_TIMESTAMP WHERE id = ?', [socket.id]);
      }
    });
  });
};

// Helper functions
const broadcastConnectionStats = (io, sessionId) => {
  const sessionClients = Array.from(connectedClients.values())
    .filter(client => client.sessionId === sessionId);
  
  const stats = {
    total: sessionClients.length,
    admins: sessionClients.filter(c => c.role === 'admin').length,
    bidders: sessionClients.filter(c => c.role === 'bidder').length,
    spectators: sessionClients.filter(c => c.role === 'spectator').length,
    teams: [...new Set(sessionClients.filter(c => c.teamName).map(c => c.teamName))].length
  };
  
  io.to(`session-${sessionId}`).emit('connection-stats', stats);
};

const setCurrentPlayer = (io, sessionId, playerId) => {
  const db = getDatabase();
  
  db.get('SELECT * FROM players WHERE id = ?', [playerId], (err, player) => {
    if (err || !player) {
      return;
    }
    
    auctionState.currentPlayer = player;
    auctionState.currentBid = player.base_price;
    auctionState.currentBidder = null;
    auctionState.timer = 30;
    
    // Update database
    db.run(`
      UPDATE auction_sessions 
      SET current_player_id = ?, current_bid = ?, current_bidder = NULL 
      WHERE id = ?
    `, [playerId, player.base_price, sessionId]);
    
    // Broadcast to all clients
    io.to(`session-${sessionId}`).emit('player-set', {
      player,
      basePrice: player.base_price
    });
    
    console.log(`🎯 Current player set: ${player.name}`);
  });
};

const sellPlayer = (io, sessionId, { playerId, teamName, amount }) => {
  const db = getDatabase();
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Update player
    db.run(`
      UPDATE players 
      SET status = 'sold', sold_to = ?, sold_price = ? 
      WHERE id = ?
    `, [teamName, amount, playerId], (err) => {
      if (err) {
        db.run('ROLLBACK');
        return;
      }
    });
    
    // Update team budget
    db.run(`
      UPDATE teams 
      SET remaining_budget = remaining_budget - ?, players_count = players_count + 1 
      WHERE name = ?
    `, [amount, teamName], (err) => {
      if (err) {
        db.run('ROLLBACK');
        return;
      }
    });
    
    db.run('COMMIT', (err) => {
      if (err) {
        return;
      }
      
      // Clear current player
      auctionState.currentPlayer = null;
      auctionState.currentBid = 0;
      auctionState.currentBidder = null;
      
      // Broadcast to all clients
      io.to(`session-${sessionId}`).emit('player-sold', {
        playerId,
        teamName,
        amount,
        timestamp: new Date()
      });
      
      console.log(`✅ Player sold: ${teamName} - ₹${amount.toLocaleString()}`);
    });
  });
};

const markPlayerUnsold = (io, sessionId, playerId) => {
  const db = getDatabase();
  
  db.run('UPDATE players SET status = "unsold" WHERE id = ?', [playerId], (err) => {
    if (err) {
      return;
    }
    
    // Clear current player
    auctionState.currentPlayer = null;
    auctionState.currentBid = 0;
    auctionState.currentBidder = null;
    
    // Broadcast to all clients
    io.to(`session-${sessionId}`).emit('player-unsold', {
      playerId,
      timestamp: new Date()
    });
    
    console.log(`❌ Player marked unsold: ${playerId}`);
  });
};

let timerInterval = null;

const startAuctionTimer = (io, sessionId) => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  auctionState.isActive = true;
  
  timerInterval = setInterval(() => {
    auctionState.timer--;
    
    io.to(`session-${sessionId}`).emit('timer-update', {
      seconds: auctionState.timer,
      isActive: auctionState.isActive
    });
    
    if (auctionState.timer <= 0) {
      clearInterval(timerInterval);
      auctionState.isActive = false;
      
      io.to(`session-${sessionId}`).emit('timer-expired', {
        currentBidder: auctionState.currentBidder,
        currentBid: auctionState.currentBid
      });
    }
  }, 1000);
};

const pauseAuctionTimer = (io, sessionId) => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  auctionState.isActive = false;
  
  io.to(`session-${sessionId}`).emit('timer-paused', {
    seconds: auctionState.timer
  });
};

const resetAuctionTimer = (io, sessionId) => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  auctionState.timer = 30;
  auctionState.isActive = true;
  
  startAuctionTimer(io, sessionId);
};

module.exports = {
  setupSocketHandlers,
  connectedClients,
  auctionState
};