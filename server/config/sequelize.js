const Sequelize = require('sequelize');
const path = require('path');
const fs = require('fs');
let db ={};

module.exports = function () {
    const sequelize = new Sequelize('mydb', 'root', 'root', {
        host: 'localhost',
        dialect: 'mysql',
    
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
    
        // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
        operatorsAliases: false,

        define: {
            underscored: true
        }
    });

    let models_path = path.join(__dirname, './../models');

    fs.readdirSync(models_path).forEach(function (file) {
        if (file.indexOf('.js') >= 0) {
            db[file.substring(0, file.length - 3)] = require(models_path + '/' + file)(sequelize);
        }
    });

    db['User'].hasMany(db['Message'], { as: 'Users' });
    db['User'].belongsToMany(db['User'], { as: 'Friend', through: 'friendships' });

    sequelize.sync();

    console.log('sequelize is running.');

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    return db;
}