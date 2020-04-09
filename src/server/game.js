
const Constants = require('../shared/constants');
const Player = require('./player');
const Upgrade = require('./upgrade');

var collisions = require('./collisions');

class Game {
  constructor() {
    this.sockets = {};
    this.players = {};
    this.bullets = [];
    this.upgrades = [new Upgrade(1000, 1000)];
    this.lastUpdateTime = Date.now();
    this.shouldSendUpdate = false;
    setInterval(this.update.bind(this), 1000 / 60);
  }

  addPlayer(socket, username) {
    this.sockets[socket.id] = socket;

    // Generate a position to start this player at.
    this.players[socket.id] = new Player(socket.id, username, randomXOnMap(), randomYOnMap());
  }

  removePlayer(socket) {
    delete this.sockets[socket.id];
    delete this.players[socket.id];
  }

  handleInput(socket, dir) {
    if (this.players[socket.id]) {
      this.players[socket.id].setDirection(dir);
    }
  }

  update() {
    // Calculate time elapsed
    const now = Date.now();
    const dt = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    // Update each bullet
    const bulletsToRemove = [];
    this.bullets.forEach(bullet => {
      if (bullet.update(dt)) {
        // Destroy this bullet
        bulletsToRemove.push(bullet);
      }
    });
    this.bullets = this.bullets.filter(bullet => !bulletsToRemove.includes(bullet));

    // Update each player
    Object.keys(this.sockets).forEach(playerID => {
      const player = this.players[playerID];
      const newBullets = player.update(dt);
      if (newBullets && newBullets.length) {
        newBullets.forEach(b => this.bullets.push(b));
      }
    });

    // Apply bullet collisions, give players score for hitting bullets
    const destroyedBullets = collisions.applyBulletCollisions(Object.values(this.players), this.bullets);
    destroyedBullets.forEach(b => {
      if (this.players[b.parentID]) {
        this.players[b.parentID].onDealtDamage();
      }
    });
    this.bullets = this.bullets.filter(bullet => !destroyedBullets.includes(bullet));

    // Apply upgrade collisions
    const destroyedUpgrades = collisions.applyUpgradeCollisions(Object.values(this.players), this.upgrades);
    this.upgrades = this.upgrades.filter(upgrade => !destroyedUpgrades.includes(upgrade));

    // Spawn upgrades randomly
    if(Math.random() > 0.99 && this.upgrades.length < Constants.MAX_UPGRADES) {
      this.upgrades.push(new Upgrade(randomXOnMap(), randomYOnMap()));
    }

    // Check if any players are dead
    Object.keys(this.sockets).forEach(playerID => {
      const socket = this.sockets[playerID];
      const player = this.players[playerID];
      if (player.hp <= 0) {
        socket.emit(Constants.MSG_TYPES.GAME_OVER);
        this.removePlayer(socket);
      }
    });

    // Send a game update to each player every other time
    if (this.shouldSendUpdate) {
      const leaderboard = this.getLeaderboard();
      Object.keys(this.sockets).forEach(playerID => {
        const socket = this.sockets[playerID];
        const player = this.players[playerID];
        socket.emit(Constants.MSG_TYPES.GAME_UPDATE, this.createUpdate(player, leaderboard));
      });
      this.shouldSendUpdate = false;
    } else {
      this.shouldSendUpdate = true;
    }
  }

  getLeaderboard() {
    return Object.values(this.players)
      .sort((p1, p2) => p2.score - p1.score)
      .slice(0, 5)
      .map(p => ({ username: p.username, score: Math.round(p.score) }));
  }

  createUpdate(player, leaderboard) {
    const nearbyPlayers = Object.values(this.players).filter(
      p => p !== player && p.distanceTo(player) <= Constants.MAP_SIZE / 2,
    );
    const nearbyBullets = this.bullets.filter(
      b => b.distanceTo(player) <= Constants.MAP_SIZE / 2,
    );
    // TODO (mrsn): factor duplicate code out into a method reference.
    const nearbyUpgrades = this.upgrades.filter(
      u => u.distanceTo(player) <= Constants.MAP_SIZE / 2,
    )

    return {
      t: Date.now(),
      me: player.serializeForUpdate(),
      // TODO (mrsn): factor duplicate code out into a method reference.
      others: nearbyPlayers.map(p => p.serializeForUpdate()),
      bullets: nearbyBullets.map(b => b.serializeForUpdate()),
      upgrades: nearbyUpgrades.map(u => u.serializeForUpdate()),
      leaderboard,
    };
  }
}

function randomXOnMap() {
  return Constants.MAP_SIZE * Math.random()
}

function randomYOnMap() {
  return Constants.MAP_SIZE * Math.random();
}

module.exports = Game;
