const fetchUserByEmail = (email,users) => {
  for (let user in users) {
    if (users[user].email == email) {
      return users[user];
    }
  }
  return null;
};

const emailLookup = function (email,users) {// if moving to a different file update parameters to (email,users);
  return Object.keys(users).filter((key) => users[key].email === email).length > 0 // array should be empty if nothing is found( checks if user exists).
}

module.exports = {
  fetchUserByEmail,
  emailLookup
}