const { hashedPassword } = require('./helpers');

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "peachesli"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "eileenlimur"}
};

const users = {
  "eileenlimur": {
    id: "eileenlimur",
    email: "eileen@limur.com",
    password: hashedPassword('peachesli')
  },
  "peachesli": {
    id: "peachesli",
    email: "peaches@li.com",
    password: hashedPassword("eileenlimur")
  }
}

module.exports = { users, urlDatabase };