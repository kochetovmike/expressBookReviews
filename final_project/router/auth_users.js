const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    {
        "username":"Alex Ngo",
        "password":"IsValidPassword1"
    }
];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    return Object.values(users).some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    return Object.values(users).some(user => user.username === username && user.password === password)
}

// User login

regd_users.post("/login", (req,res) => {
    const {username, password} = req.body;

    if (req.session.authorization){
      return res.status(403).json({message: "You are already logged in."})
    }

    if (!username || !password){
      return res.status(200).json({ message: "username and password are required to login." });
    }
  
    if (authenticatedUser (username, password)){
      //req.session.username = username;
      let token = jwt.sign({ username: username }, 'access', { expiresIn: '1h' });
      req.session.authorization = { accessToken: token }; 
      console.log(req.session.authorization);
  
  
      return res.status(200).json({message: "Login successful."});
    } else {
      return res.status(401).json({ message: "Invalid username or password."});
    }
});

// Add a book review

regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const newReview = req.body.review;

    if (!req.session.authorization){
      return res.status(401).json({ message: "Please login in order to add/update books."});
    }
  
    let token = req.session.authorization['accessToken'];
    
    jwt.verify(token, "access", (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token. Please log in again." });
      }
  
      const username = user.username; 

      if (!books[isbn]) {
        return res.status(404).json({ message: "The book was not found."});
      }
    
      if (!books[isbn].reviews) {
        books[isbn].reviews = {};
      } 
  
      if (books[isbn].reviews[username]){
        books[isbn].reviews[username] = newReview;
        return res.status(200).json({ message: "Review updated successfully" });
      } else {
       
        books[isbn].reviews[username] = newReview;
        return res.status(201).json({ message: "Review added successfully" });
      }
  
  })});
  
// User delete

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
  
    console.log("Session authorization:", req.session.authorization);
  
    if (!req.session.authorization) {
      return res.status(401).json({ message: "Please login in order to delete reviews." });
    }
  
    let token = req.session.authorization['accessToken'];
  
    jwt.verify(token, "access", (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token. Please log in again." });
      }
  
      const username = user.username;
  
      if (!books[isbn]) {
        return res.status(404).json({ message: "The book was not found." });
      }

      if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "No review found for this book from the logged-in user." });
      }
  
      delete books[isbn].reviews[username];
      return res.status(200).json({ message: "Review deleted successfully" });
    });
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
