const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 3000;
const SALT_ROUNDS = 10;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "replace_this_with_a_secure_key",
    resave: false,
    saveUninitialized: true,
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const USERS = [
  {
    id: 1,
    username: "AdminUser",
    email: "admin@example.com",
    password: bcrypt.hashSync("admin123", SALT_ROUNDS), //In a database, you'd just store the hashes, but for
    // our purposes we'll hash these existing users when the
    // app loads
    role: "admin",
  },
  {
    id: 2,
    username: "RegularUser",
    email: "user@example.com",
    password: bcrypt.hashSync("user123", SALT_ROUNDS),
    role: "user", // Regular user
  },
];

// GET /login - Render login form
app.get("/login", (request, response) => {
  const errorMessage = request.query.error || null;
  return response.render("login", { errorMessage });
});

// POST /login - Allows a user to login
app.post("/login", (request, response) => {
  const { email, password } = request.body;
  if (!email || !password) {
    return response
      .status(400)
      .redirect("/login?error=All fields are required");
  }
  const user = USERS.find((user) => user.email === email);
  if (!!user && bcrypt.compareSync(password, user.password)) {
    request.session.email = email;
    console.log("login successful!");
    return response.redirect("/");
  }
  return response.redirect("/login?error=Invalid email or password");
});

// GET /signup - Render signup form
app.get("/signup", (request, response) => {
  const errorMessage = request.query.error || null;
  return response.render("signup", { errorMessage });
});

// POST /signup - Allows a user to signup
app.post("/signup", (request, response) => {
  const { username, email, password } = request.body;
  if (!username || !email || !password) {
    return response
      .status(400)
      .render("signup", { errorMessage: "All fields are required" });
  }

  if (USERS.find((user) => user.username === username)) {
    return response
      .status(400)
      .render("signup", { errorMessage: "Username is already taken" });
  }

  if (USERS.find((user) => user.email === email)) {
    return response
      .status(400)
      .render("signup", { errorMessage: "Email is already registered" });
  }

  const id = USERS.length + 1;
  const role = "user";
  const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);

  USERS.push({
    id,
    username,
    email,
    password: hashedPassword,
    role,
  });
  return response.redirect("/");
});

// GET / - Render index page or redirect to landing if logged in
app.get("/", (request, response) => {
  if (request.session.user) {
    return response.redirect("/landing");
  }
  response.render("index");
});

// GET /landing - Shows a welcome page for users, shows the names of all users if an admin
app.get("/landing", (request, response) => {});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
