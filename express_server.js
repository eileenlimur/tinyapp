const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

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

app.get("/", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
})

app.post('/urls', (req, res) => {
  const shortUrl = generateRandomString();
  const longUrl = req.body.longURL;
  urlDatabase[shortUrl] = longUrl;
  res.redirect('/urls/' + shortUrl);
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  if (!Object.keys(urlDatabase).includes(req.params.shortURL)) {
    res.redirect('/urls/new');
  }
  const longUrl = urlDatabase[req.params.shortURL]
  console.log(req.params.shortURL);
  res.redirect(longUrl);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});