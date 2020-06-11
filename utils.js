const hashedPassword = function (password) {
  const bcrypt = require('bcrypt');
  const saltRounds = 10;
  return bcrypt.hashSync(password, saltRounds)
}

module.exports = {
  hashedPassword
}