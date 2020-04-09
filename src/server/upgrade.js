const shortid = require('shortid');
const ObjectClass = require('./object');
const Constants = require('../shared/constants');

class Upgrade extends ObjectClass {
  constructor(x, y) {
    super(shortid(), x, y, Math.random() * Math.PI, 0);
  }

  // Returns true if the powerup should be destroyed
  update(dt) {
    // Spin in place
    this.setDirection(this.direction += Constants.UPGRADE_SPIN_RATE);
    super.update(dt);
    // Upgrades will live forever.
    return false;
  }
}

module.exports = Upgrade;
