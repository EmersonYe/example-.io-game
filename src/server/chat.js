const shortid = require('shortid');
const Constants = require('../shared/constants');

class Chat {
    constructor(parentID, text) {
        this.id = shortid();
        this.parentID = parentID;
        this.text = text;
        this.creationTime = Date.now();
    }

  serializeForUpdate() {
    return {
      id: this.id,
      parentID: this.parentID,
      text: this.text,
      creationTime: this.creationTime,
    };
  }
}

module.exports = Chat;