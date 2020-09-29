const express = require('express');

const { hashedPassword,
  dateCreated,
  generateRandomString,
  userSearchByEmail,
  findIdByEmail,
  userUrlsDatabase,
  urlBelongsToUserCheck } = require('./helpers');
const { users, urlDatabase } = require('./databases');

const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const morgan = require('morgan');

const PORT = 8080;
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['hola', 'superduper']
}))
app.use(morgan('tiny'));

app.use(express.static("public"));

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hey! Let\'s turn long URLs into short URLs 😍!', user: users[req.session.user_id] };
  res.render("hello_world", templateVars);
});

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  if (req.body.email === "" || req.body.password === "") {
    res.response(400).send('Fill in all the fields to register!');
  }
  let templateVars = { user: null }
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  if (userSearchByEmail(email, users)) {
    res.status(403).send('email already registered');
  }
  const password = hashedPassword(req.body.password);
  const id = generateRandomString();
  users[id] = { id, email, password };
  req.session.user_id = id;
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  };
  const templateVars = { user: null};
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = userSearchByEmail(email, users);
  const id = findIdByEmail(email, users);

  if (!user || !bcrypt.compareSync(password, user['password'])) {
    res.status(403).send('There was a problem with your authentification.');
  }

  req.session.user_id = id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
})

//show URLS
app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const userURLS = userUrlsDatabase(id, urlDatabase);
  let templateVars = { urls: userURLS, user: users[id]};
  res.render("urls_index", templateVars);
});

//new shortURL creator
app.get('/urls/new', (req, res) => {
  const id = req.session.user_id;
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
  const id = req.session.user_id;
  if(!id) {
    res.status(403).send('Log in or register to post and edit TinyURLs.');
  }
  if(longUrl === "") {
    res.status(400).send('You need a longURL for your tinyURL');
  }
  urlDatabase[shortUrl] = { longURL: longUrl, userID: id, dateCreated: dateCreated() };
  res.redirect('/urls/' + shortUrl);
});

//shortURL landing page
app.get('/urls/:shortURL', (req, res) => {
  const id = req.session.user_id;
  const shortURL = req.params.shortURL;
  let templateVars = { shortURL, user: users[id], belongs: false};
  if (!req.session.user_id) {
    templateVars['user'] = null;
  }
  if (urlDatabase[shortURL]) {
    templateVars['longURL'] = urlDatabase[shortURL]['longURL'];
    if (urlBelongsToUserCheck(id, shortURL, urlDatabase)) {
      templateVars['belongs'] = true;
    }
  }
  res.render('urls_show', templateVars);
});

//edit longURL associated with shortURL
app.post('/urls/:shortURL', (req, res) => {
  let urlId = req.params.shortURL;
  let userId = req.session.user_id;
  console.log(userId);
  let longUrl = req.body.longURL
  console.log(longUrl);
  if (!userId) {
    res.status(400).send('Login to make and edit tinyURLs');
  }
  if (longUrl === "") {
    res.status(400).send('You need a longURL for your tinyURL');
  }
  if (urlBelongsToUserCheck(userId, urlId, urlDatabase)) {
    urlDatabase[urlId]['longURL'] = longUrl;
    console.log(urlDatabase[urlId]['longURL']);
  } else {
    res.status(403).send('You can\'t edit this URL because it isn\'t yours!');
  }
  res.redirect('/urls/');
});

//deletes shortURL
app.post('/urls/:shortURL/delete', (req, res) => {
  let urlId = req.params.shortURL;
  let userId = req.session.user_id;
  if (urlBelongsToUserCheck(userId, urlId, urlDatabase)) {
    delete urlDatabase[req.params.shortURL]; 
  } else {
    res.status(403).send('You can\'t delete this URL because it isn\'t yours!');
  }
  res.redirect('/urls');
});

//if shortURL has longURL, go there, else redirect to shortURLMaker
app.get('/u/:shortURL', (req, res) => {
  if (!Object.keys(urlDatabase).includes(req.params.shortURL)) {
    res.status(404).send('This tinyURL does not exist.')
  }
  const longUrl = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longUrl);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});