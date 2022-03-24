const fetchUserByEmail = (email, users) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

const emailLookup = function (email, users) {
  return Object.keys(users).filter((key) => users[key].email === email).length > 0 // array should be empty if nothing is found( checks if user exists).
}

const generateRandomString = () => {
  const result = Math.random().toString(36).substr(2, 5)
  return result;
}

module.exports = {
  fetchUserByEmail,
  emailLookup,
  generateRandomString
}