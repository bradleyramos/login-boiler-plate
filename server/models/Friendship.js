const Sequelize = require('sequelize');

module.exports = function (sequelize) {
    /* This defines a User with a first name, last name, email, phone number, and password */
    const Friendship = sequelize.define('friendships', {
        user_id: {
          type: Sequelize.INTEGER
        },
        friend_id: {
          type: Sequelize.INTEGER
        },
        is_accepted: {
          type: Sequelize.BOOLEAN
        }
        });

    return Friendship;
}
