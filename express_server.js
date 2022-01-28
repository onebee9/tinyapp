const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const { response } = require("express");
const bcrypt = require('bcryptjs');
const { fetchUserByEmail, emailLookup } = require('../tinyapp/helpers');

const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  }
}

const users = {
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
}

const generateRandomString = function () {
  let result = Math.random().toString(36).substr(2, 5)
  return result;
}

const urlsForUser = function (id) {
  let usersUrlList = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      usersUrlList[key] = urlDatabase[key];
    }
  }
  return usersUrlList;
}


app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieSession());


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let id = req.session.user_id;
  let urlsList = urlsForUser(id);
  if (id) {
    const templateVars = {
      urlsList,
      user: users[id]
    };
    res.render("urls_index", templateVars);
  } else {
    res.send('Login to view the magic');
  }
});

app.get("/urls/new", (req, res) => {
  let id = req.session.user_id;
  if (id) {
    const templateVars = {
      user: users[id]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let id = req.session.user_id;
  let user = users[id];
  let shortURL = req.params.shortURL;
  let longUrl = urlDatabase[shortURL].longURL;

  const templateVars = {
    shortURL,
    longUrl,
    user
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/login", (req, res) => {
  let id = req.session.user_id;

  if (id) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: null
    };
    res.render("login", templateVars);
  }
});

app.get("/register", (req, res) => {
  let id = req.session.user_id;
  if (id) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: null
    };
    res.render("registration", templateVars);
  }
});


app.post("/register", (req, res) => {
  let email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !hashedPassword) {
    res.status(400).send('Please provide username and password');
    return;
  }

  if (emailLookup(email)) {
    res.status(403).send('user already exists');
  } else {
    let id = generateRandomString();
    users[id] = {
      id,
      email,
      hashedPassword
    }
    req.session.user_id = id;
    res.redirect('/urls');
  }
});

app.post("/urls", (req, res) => {
  let id = req.session.user_id;
  if (id) {
    let randomShortURL = generateRandomString();
    urlDatabase[randomShortURL] = {
      longURL: req.body.longURL,
      userID: id
    };

    res.redirect(`/urls/${randomShortURL}`);
  } else {
    res.status(401).send('You do not have the right permissions to do this');
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let id = req.session.user_id;
  let removeURL = req.params.shortURL;
  let usersUrlList = urlsForUser(id);
  //If count is not increased, then no matches were found for the shortURL
  let count = 0;

  //Checks if the parameter belongs to the logged in user. 
  if (id) {
    for (let key in usersUrlList) {
      if (key == removeURL) {
        count = count + 1;
        delete urlDatabase[removeURL];
        res.redirect('/urls');
      }
    }

    if (count < 1) {
      res.status(401).send('This Url does not exist');
    }
  } else {
    res.status(401).send('You have to log in to delete urls');
  }
});

app.post("/urls/:id", (req, res) => {
  let newUrl = req.body.update;
  urlDatabase[req.params.id].longURL = newUrl;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = fetchUserByEmail(email).hashedPassword;
  const userID = fetchUserByEmail(email).id;
  const compared = bcrypt.compareSync(password, hashedPassword);

  ; // returns true if credentials exist 
  if (emailLookup(email) && compared) {
    req.session.user_id = userID;
    res.redirect('/urls');
  } else {
    res.status(403).send('Incorrect username or password');
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});