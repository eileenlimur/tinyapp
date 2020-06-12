/*
/url
(Stretch) the date the short URL was created
(Stretch) the number of times the short URL was visited
(Stretch) the number number of unique visits for the short URL
/url/:id
(Stretch) the date the short URL was created
(Stretch) the number of times the short URL was visited
(Stretch) the number of unique visits for the short URL
(Must) returns HTML with a relevant error message if user not logged in
GET /u/:id
if URL for the given ID does not exist:
(Minor) returns HTML with a relevant error message
POST /urls/
if user is not logged in:
(Minor) returns HTML with a relevant error message
POST /urls/:id
if user is not logged in:
(Minor) returns HTML with a relevant error message
if user is logged it but does not own the URL for the given ID:
(Minor) returns HTML with a relevant error message

*/

const express = require('express');

const { hashedPassword,
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

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  if (req.session) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hey! Let\'s turn long URLs into short URLs!', user: users[req.session.user_id] };
  res.render("hello_world", templateVars);
});

app.get('/register', (req, res) => {
  req.session = null;
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

  if (!user) {
    res.status(403).send('no such user');
  }
  
  if (!bcrypt.compareSync(password, user['password'])) {
    res.status(403).send('wrong password');
  }

  req.session.user_id = id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls')
})

//show URLS
app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const userURLS = userUrlsDatabase(id, urlDatabase);
  let templateVars = { urls: userURLS, user: users[id]};
  res.render("urls_index", templateVars);
});

//shows URLS in JSON
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//page to create new shortURL
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
  // if(!id) {

  // }
  urlDatabase[shortUrl] = { longURL: longUrl, userID: id };
  console.log(urlDatabase);
  res.redirect('/urls/' + shortUrl);
});

//small table showing shortURL matched with longURL
app.get('/urls/:shortURL', (req, res) => {
  const id = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (!Object.keys(urlDatabase).includes(shortURL)) {
    res.status(404).send('This tinyURL leads to nothing!');
  }
  let templateVars = { shortURL, longURL: urlDatabase[shortURL]['longURL'], user: users[id], belongs: false};
  if (urlBelongsToUserCheck(id, shortURL, urlDatabase)) {
    templateVars['belongs'] = true;
  }
  res.render('urls_show', templateVars);
});

//edit longURL associated with shortURL
app.post('/urls/:shortURL', (req, res) => {
  let urlId = req.params.shortURL;
  let userId = req.session.user_id;
  let longUrl = req.body.longURL
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