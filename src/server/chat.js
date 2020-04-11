const shortid = require('shortid');
const Constants = require('../shared/constants');

class Chat {
    constructor(parentID, text) {
        this.parentID = parentID;
        this.text = text;
        this.id = shortid();
    }

  serializeForUpdate() {
    return {
      id: this.id,
      parentID: this.parentID,
      text: this.text,
      y: this.y,
    };
  }
}

module.exports = Chat;