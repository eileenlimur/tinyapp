const express = require('express');

const { hashedPassword } = require('./utils');
const { users, urlDatabase } = require('./databases');

const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const PORT = 8080;
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('tiny'));

app.set('view engine', 'ejs');

////////////helper functions///////////

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
const userSearchByEmail = function(email) {
  return Object.values(users).find(userObj=>userObj.email === email);
};

//returns user id given email
const findIdByEmail = function(email) {
  const user = userSearchByEmail(email);
  const id = user['id'];
  return id;
}

//generates database of user's urls
const userUrlsDatabase = function(id) {
  const userURLS = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key]['userID'] === id) {
      userURLS[key] = urlDatabase[key];
    }
  }
  return userURLS;
}

//checks if a url belongs to a user
const urlBelongsToUserCheck = function(userId, urlId) {
  if (urlDatabase[urlId]['userID'] === userId) {
    return true;
  }
};

//routes

app.get("/", (req, res) => {
  let templateVars = { greeting: 'Hey! Let\'s turn long URLs into short URLs!', user: users[req.cookies['user_id']] };
  res.render("hello_world", templateVars);
});

app.get('/register', (req, res) => {
  res.clearCookie('user_id');
  let templateVars = { user: users[req.cookies['user_id']] }
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  if (userSearchByEmail(email)) {
    res.status(403).send('email already registered');
  }
  const password = hashedPassword(req.body.password);
  const id = generateRandomString();
  users[id] = { id, email, password };
  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']]};
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = userSearchByEmail(email)
  const id = findIdByEmail(email);

  if (!user) {
    res.status(403).send('no such user');
  }
  
  if (!bcrypt.compareSync(password, user['password'])) {
    res.status(403).send('wrong password');
  }

  res.cookie('user_id', id);
  res.redirect('/urls')
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls')
})

//show URLS
app.get("/urls", (req, res) => {
  const id = req.cookies['user_id'];
  const userURLS = userUrlsDatabase(id);
  let templateVars = { urls: userURLS, user: users[id]};
  res.render("urls_index", templateVars);
});

//shows URLS in JSON
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//page to create new shortURL
app.get('/urls/new', (req, res) => {
  const id = req.cookies['user_id'];
  if (!id) {
    res.redirect('/login');
  }
  let templateVars = { user: users[id] };
  res.render('urls_new', templateVars);
})

//add new shortURL
app.post('/urls', (req, res) => {
  const shortUrl = generateRandomString();
  const longUrl = req.body.longURL;
  const id = req.cookies['user_id'];
  urlDatabase[shortUrl] = { longURL: longUrl, userID: id };
  res.redirect('/urls/' + shortUrl);
});

//small table showing shortURL matched with longURL
app.get('/urls/:shortURL', (req, res) => {
  const id = req.cookies['user_id'];
  console.log(id);
  const shortURL = req.params.shortURL;
  console.log(shortURL);
  if (!Object.keys(urlDatabase).includes(shortURL)) {
    res.status(404).send('This tinyURL leads to nothing!');
  }
  let templateVars = { shortURL, longURL: urlDatabase[shortURL]['longURL'], user: users[id], belongs: false};
  if (urlBelongsToUserCheck(id, shortURL)) {
    console.log('yeah');
    templateVars['belongs'] = true;
  }
  res.render('urls_show', templateVars);
});

//edit longURL associated with shortURL
app.post('/urls/:shortURL', (req, res) => {
  let urlId = req.params.shortURL;
  let userId = req.cookies['user_id'];
  let longUrl = req.body.longURL
  if (urlBelongsToUserCheck(userId, urlId)) {
    urlDatabase[urlId]['longURL'] = longUrl;
    console.log(urlDatabase[urlId]['longURL']);
  } else {
    res.status(403).send('You can\'t edit this URL because it isn\'t yours!');
  }
  res.redirect('/urls/' + urlId);
});

//deletes shortURL
app.post('/urls/:shortURL/delete', (req, res) => {
  let urlId = req.params.shortURL;
  let userId = req.cookies['user_id'];
  if (urlBelongsToUserCheck(userId, urlId)) {
    delete urlDatabase[req.params.shortURL]; 
  } else {
    res.status(403).send('You can\'t delete this URL because it isn\'t yours!');
  }
  res.redirect('/urls');
});

//if shortURL has longURL, go there, else redirect to shortURLMaker
app.get('/u/:shortURL', (req, res) => {
  if (!Object.keys(urlDatabase).includes(req.params.shortURL)) {
    res.redirect('/urls/new');
  }
  const longUrl = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longUrl);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


/*
An unused example of sending an html response directly

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
*/