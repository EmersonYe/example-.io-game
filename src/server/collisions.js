const Constants = require('../shared/constants');

// Returns an array of bullets to be destroyed.
function applyBulletCollisions(players, bullets) {
  const destroyedBullets = [];
  for (let i = 0; i < bullets.length; i++) {
    // Look for a player (who didn't create the bullet) to collide each bullet with.
    // As soon as we find one, break out of the loop to prevent double counting a bullet.
    for (let j = 0; j < players.length; j++) {
      const bullet = bullets[i];
      const player = players[j];
      if (
        bullet.parentID !== player.id &&
        player.distanceTo(bullet) <= Constants.PLAYER_RADIUS + Constants.BULLET_RADIUS
      ) {
        destroyedBullets.push(bullet);
        player.takeBulletDamage();
        break;
      }
    }
  }
  return destroyedBullets;
};

function applyUpgradeCollisions(players, upgrades) {
  const destroyedUpgrades = [];
  for (let i = 0; i < upgrades.length; i++) {
    // Look for a player to collide each upgrade with.
    // As soon as we find one, break out of the loop to prevent double counting an upgrade.
    for (let j = 0; j < players.length; j++) {
      const upgrade = upgrades[i];
      const player = players[j];
      if (player.distanceTo(upgrade) <= Constants.PLAYER_RADIUS + Constants.UPGRADE_RADIUS) {
        destroyedUpgrades.push(upgrade);
        player.upgrade();
        break;
      }
    }
  }
  return destroyedUpgrades;
};

module.exports = {
  applyBulletCollisions,
  applyUpgradeCollisions
}