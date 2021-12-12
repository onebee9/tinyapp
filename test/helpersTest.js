const { assert } = require('chai');

const { fetchUserByEmail} = require('../helpers.js').fetchUserByEmail;

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

describe('fetchUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = fetchUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equalx(user === expectedUserID,'Should return the user object that contains that email value');
  });
  it('should return a user with valid email', function() {
    const user = fetchUserByEmail("users@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user === undefined,'Nonexistent emails should return undefined');
  });
});