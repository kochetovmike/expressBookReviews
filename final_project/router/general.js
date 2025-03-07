const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Simulate an async function that returns the local books
const fetchBooks = async () => {
  // Simulate asynchronous fetching of books (even though it's local)
  return new Promise((resolve) => {
    resolve(books);
  });
};

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  const userExists = users.some(user => user.username === username);  // Check if the username already exists

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (userExists) {
    return res.status(409).json({ message: "User already registered." });
  } else {
    const newUser = {
      username: username,
      password: password
    };
    users.push(newUser);
    return res.status(201).json({ message: "User successfully registered." });
  }
});


// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const booksData = await fetchBooks(); 
    return res.json({ message: "Books retrieved successfully", data: booksData });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book list", error: error.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const booksData = await fetchBooks();
    if (booksData[isbn]) {
      return res.json({ message: "Book retrieved successfully", data: booksData[isbn] });
    } else {
      return res.status(404).json({ message: "No books found with this ISBN" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book details", error: error.message });
  }
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const booksData = await fetchBooks(); 
    const results = Object.values(booksData).filter(book => book.author === author);

    if (results.length > 0) {
      return res.json({ message: "Books retrieved successfully", data: results });
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book details", error: error.message });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const booksData = await fetchBooks(); 
    const results = Object.values(booksData).filter(book => book.title === title);

    if (results.length > 0) {
      return res.json({ message: "Books retrieved successfully", data: results });
    } else {
      return res.status(404).json({ message: "No books found by this title" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book details", error: error.message });
  }
});

//  Get book review
public_users.get('/review/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const booksData = await fetchBooks();
    const book = booksData[isbn];

    if (book) {
      if (book.reviews && Object.keys(book.reviews).length > 0) {
        return res.json({ message: "Reviews retrieved successfully", data: book.reviews });
      } else {
        return res.status(404).json({ message: "No reviews found for this ISBN" });
      }
    } else {
      return res.status(404).json({ message: "No books found with this ISBN" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book reviews", error: error.message });
  }
});

module.exports.general = public_users;
