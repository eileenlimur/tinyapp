const hashedPassword = function (password) {
  const bcrypt = require('bcrypt');
  const saltRounds = 10;
  return bcrypt.hashSync(password, saltRounds)
}

//generates 6 random alphanumeric characters
const generateRandomString = function () {
  let generatedString = "";
  const chars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let letter = 0; letter < 6; letter++) {
    let randomIndex = Math.floor((Math.random()*36));
    generatedString += chars[randomIndex];
  }
  return generatedString;
}

//returns user object given user's email
const userSearchByEmail = function(email, database) {
  const user = Object.values(database).find(userObj=>userObj.email === email);
  return user;
};

//returns user id given email
const findIdByEmail = function(email, database) {
  const user = Object.values(database).find(userObj=>userObj.email === email);
  if (!user) {
    return null;
  } else {
    const id = user['id'];
    return id;
  }
}

//generates database of user's urls
const userUrlsDatabase = function(id, database) {
  const userURLS = {};
  for (let key in database) {
    if (database[key]['userID'] === id) {
      userURLS[key] = database[key];
    }
  }
  return userURLS;
}

//checks if a url belongs to a user
const urlBelongsToUserCheck = function(userId, urlId, database) {
  if (database[urlId]['userID'] === userId) {
    return true;
  } else {
    return false;
  }
};

module.exports = {
  hashedPassword,
  generateRandomString,
  userSearchByEmail,
  findIdByEmail,
  userUrlsDatabase,
  urlBelongsToUserCheck
}