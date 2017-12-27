const models = require('../models/index');
const Op = models.Sequelize.Op;

module.exports = {
  jwtValidateFunction(decoded, request, callback) {
    request
      .server
      .log('info', decoded);
    // do your checks to see if the person is valid
    const {username} = decoded;
    models.User.findOne({
      where: {
        [Op.or]: [{ username }]
      }
    }).then(user=>{
      if (user.username!==username) {
        return callback(null, false);
      } else {
        return callback(null, true);
      }
    }).catch(error=>{
      throw error;
    });
  }
}