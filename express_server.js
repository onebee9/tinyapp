const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const {
  fetchUserByEmail,
  emailLookup,
  generateRandomString
} = require('../tinyapp/helpers');
const PORT = 3000;

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({
  extended: true
}));

//Makeshift database for user provided URLS
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

//Retrives urls belonging to unique users
const urlsForUser = (id) => {
  const usersUrlList = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      usersUrlList[key] = urlDatabase[key];
    }
  }
  return usersUrlList;
}

//makeshift database for user personal data
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

//home
app.get("/", (req, res) => {
  res.redirect("/login");
});

//resource routes

app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const urlsList = urlsForUser(id);
  if (id) {
    const templateVars = {
      urlsList,
      user: users[id]
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  if (id) {
    const templateVars = {
      user: users[id]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
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

app.post("/urls/:shortURL", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const shortURL = req.params.shortURL;
  const longURl = urlDatabase[shortURL].longURL;

  const templateVars = {
    shortURL,
    longURl,
    user
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const id = req.session.user_id;
  if (id) {
    const randomShortURL = generateRandomString();
    urlDatabase[randomShortURL] = {
      longURL: req.body.longURL,
      userID: id
    };
    res.redirect(`/urls`);
  } else {
    res.status(401).send('You do not have the right permissions to do this');
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.session.user_id;
  const removeURL = req.params.shortURL;
  const usersUrlList = urlsForUser(id);

  //If count is not increased, then no matches were found for the shortURL
  let count = 0;

  //Checks that the parameter belongs to the logged in user. 
  if (id) {
    for (const key in usersUrlList) {
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

app.post("/url/:id", (req, res) => {
  const newUrl = req.body.update;
  urlDatabase[req.params.id].longURL = newUrl;
  res.redirect('/urls');
});


//user routes-------
app.get("/login", (req, res) => {
  const id = req.session.user_id;

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
  const id = req.session.user_id;
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
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (email == "" || password == "") {
    res.status(400).send('Please provide username and password');
    return;
  } else if (emailLookup(email, users)) {
    res.status(403).send('user already exists, try again');
    return;
  } else {
    const id = generateRandomString();
    users[id] = {
      id,
      email,
      hashedPassword
    }
    req.session.user_id = id;
    res.redirect('/urls');
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Ensures that users provide an email and password
  if (email == "" || password == "") {
    res.status(400).send('Please provide username and password');

    // Checks that the email exists and pulls the users data
  } else if (emailLookup(email, users)) {
    const hashedPassword = fetchUserByEmail(email, users).hashedPassword;
    const userID = fetchUserByEmail(email, users).id;
    const compared = bcrypt.compareSync(password, hashedPassword);

    // Confirms that the password matches one in the database
    if (compared) {
      req.session.user_id = userID;
      res.redirect('/urls');
    } else {
      res.status(403).send('Incorrect password');
    }
  } else {
    res.status(403).send('Incorrect username or password');
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});