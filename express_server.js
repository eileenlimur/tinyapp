const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('combined'));

const PORT = 8080;

app.set('view engine', 'ejs');

//generates 6 random alphanumeric characters
function generateRandomString() {
  let generatedString = "";
  const chars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let letter = 0; letter < 6; letter++) {
    let randomIndex = Math.floor((Math.random()*36));
    generatedString += chars[randomIndex];
  }
  return generatedString;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "eileenlimur": {
    id: "eileenlimur",
    email: "eileen@limur.com",
    password: "peachesli"
  },
  "peachesli": {
    id: "peachesli",
    email: "peaches@li.com",
    password: "eileenlimur"
  }
}

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
  const password = req.body.password;
  const id = generateRandomString();
  users[id] = { id, email, password };
  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  res.cookie('user_id', req.body.user_id);
  res.redirect('/urls')
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls')
})

//show URLS
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']]};
  res.render("urls_index", templateVars);
});

//shows URLS in JSON
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//page to create new shortURL
app.get('/urls/new', (req, res) => {
  let templateVars = { user: users[req.cookies['user_id']] };
  res.render('urls_new', templateVars);
})

//add new shortURL
app.post('/urls', (req, res) => {
  const shortUrl = generateRandomString();
  const longUrl = req.body.longURL;
  urlDatabase[shortUrl] = longUrl;
  res.redirect('/urls/' + shortUrl);
});

//small table showing shortURL matched with longURL
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  let templateVars = { shortURL, longURL: urlDatabase[shortURL], user: users[req.cookies['user_id']]};
  res.render("urls_show", templateVars);
});

//edit longURL associated with shortURL
app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;                       
  res.redirect('/urls/' + req.params.shortURL);
});

//deletes shortURL
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];                       
  res.redirect('/urls');
});

//if shortURL has longURL, go there, else redirect to shortURLMaker
app.get('/u/:shortURL', (req, res) => {
  if (!Object.keys(urlDatabase).includes(req.params.shortURL)) {
    res.redirect('/urls/new');
  }
  const longUrl = urlDatabase[req.params.shortURL]
  console.log(req.params.shortURL);
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