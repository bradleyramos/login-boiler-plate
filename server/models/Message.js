const Sequelize = require('sequelize');

module.exports = function (sequelize) {
  /* Messages are an anticipated feature, but I decided to set up the implementation for later */
  const Message = sequelize.define('messages', {
    content: Sequelize.STRING
  });

  return Message;
}
