const { assert } = require('chai');

const { userSearchByEmail } = require('../helpers.js');

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
  }
};

describe('userSearchByEmail', () => {
  it('should return a user with a valid email', function() {
    const user = getUserByEmail('user@example.com', users);
    const expectedOutput = 'userRandomID';
    assert.equal(user, expectedOutput)
  });
});