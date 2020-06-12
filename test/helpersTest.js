const { assert } = require('chai');

const { userSearchByEmail,
  findIdByEmail,
  userUrlsDatabase,
  urlBelongsToUserCheck } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID", 
    email: "user3@example.com", 
    password: "ladeedadeeda"
  }
};

const urlDatabase = {
  "1": { longURL: "http://www.abcdefghihkl.com", userID: "userRandomID"},
  "2": { longURL: "http://www.mnopqrstuvxyz.com", userID: "user2RandomID"},
  "3": { longURL: "http://www.123456789.com", userID: "userRandomID" }
};

describe('userSearchByEmail', () => {
  it('should return a user with a valid email', () => {
    const user = userSearchByEmail('user@example.com', testUsers);
    const expectedOutput = {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    };
    assert.deepEqual(user, expectedOutput)
  });
  it('should return undefined if the email has not been registered', () => {
    const user = userSearchByEmail('user@whoknows.com', testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput)
  });
});

describe('findIdByEmail', () => {
  it('should return a user id with a valid email', () => {
    const userId = findIdByEmail('user@example.com', testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(userId, expectedOutput);
  });
  it('should return undefined if the email has not been registered', () => {
    const userId = findIdByEmail('user@whoknows.com', testUsers);
    const expectedOutput = null;
    assert.equal(userId, expectedOutput);
  });
});

describe('userUrlsDatabase', () => {
  it('should return an object containing all of a user\'s URLs if the input user id exists', () => {
    const userURLs = userUrlsDatabase('userRandomID', urlDatabase);
    const expectedOutput = {
      "1": { longURL: "http://www.abcdefghihkl.com", userID: "userRandomID"},
      "3": { longURL: "http://www.123456789.com", userID: "userRandomID" }
    }
    assert.deepEqual(userURLs, expectedOutput)
  });
  it('should return an object containing all of a user\'s URLs if the input user id exists', () => {
    const userURLs = userUrlsDatabase('user2RandomID', urlDatabase);
    const expectedOutput = {
      "2": { longURL: "http://www.mnopqrstuvxyz.com", userID: "user2RandomID"}
    };
    assert.deepEqual(userURLs, expectedOutput)
  });
  it('should return null if the input user id does not exist', () => {
    const userURLs = userUrlsDatabase('user2RandomID', urlDatabase);
    const expectedOutput = {
      "2": { longURL: "http://www.mnopqrstuvxyz.com", userID: "user2RandomID"}
    };
    assert.deepEqual(userURLs, expectedOutput)
  });
  it('should return an empty array if no urls possess that user\'s id', () => {
    const userURLs = userUrlsDatabase('user3RandomID', urlDatabase);
    const expectedOutput = {};
    assert.deepEqual(userURLs, expectedOutput)
  });
});

describe('urlBelongsToUserCheck', () => {
  it('should return if the input url belongs to the input user id', () => {
    const urlCheck = urlBelongsToUserCheck('userRandomID', "1", urlDatabase);
    const expectedOutput = true;
    assert.deepEqual(urlCheck, expectedOutput)
  });
  it('should return false if the input url does not belong to the input user id', () => {
    const urlCheck = urlBelongsToUserCheck('userRandomID', "2", urlDatabase);
    const expectedOutput = false;
    assert.deepEqual(urlCheck, expectedOutput)
  });
});