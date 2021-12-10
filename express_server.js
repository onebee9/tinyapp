const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

  for (let id in users) {
    const user = users[id];

    if (user.email === email) {
      res.status(403).send('user already exists');
      return;
    }
  }

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let id = req.cookies['user_id'];
  const templateVars = { urls: urlDatabase, user: users[id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let id = req.cookies['user_id'];
  const templateVars = { user: users[id] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  console.log(req.params);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  console.log(req.params);
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) => {
  let id = req.cookies['user_id'];
  const templateVars = { user: null };

  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  let id = generateRandomString();
  users[id] = {
    id,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie('user_id', id);
  console.log(users);
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  let randomShortURL = generateRandomString();
  urlDatabase[randomShortURL] = req.body.longURL;
  res.redirect(`/urls/:${randomShortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let removeURL = req.params.shortURL;
  delete urlDatabase[removeURL];
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
  let newUrl = req.body.update;
  urlDatabase[req.params.id] = newUrl;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});