const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let userswithsamename = users.filter((user)=>{
        return user.username === username
      });
      if(userswithsamename.length > 0){
        return true;
      } else {
        return false;
      }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
    }
  
    if (authenticatedUser(username,password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        
        req.session.authorization = {
            accessToken,username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
})

regd_users.post("/customer/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    if (!isValid(username)) {
      return res.status(400).json({message: "Invalid username"});
    }
    if (authenticatedUser(username,password)) {
      const token = jwt.sign({username}, 'your-secret-key', {expiresIn: 60 * 60});
      req.session.username = username;
    
      return res.status(200).json({message: "Logged in successfully", token});
    } else {
      return res.status(401).json({message: "Invalid username or password"});
}});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    console.log('entered here')
    const isbn = req.params.isbn;
    if (!isbn) {
        return res.status(404).send('ISBN required')
    }
    let filtered_book = books[isbn];
    if (filtered_book) {
        let review = req.query.review;
        let reviewer = req.session.authorization['username'];
        if (review) {
            filtered_book['reviews'][reviewer] = review;
            books[isbn] = filtered_book;
        } else {
            res.send('review is empty')
        }
        res.send(`The review for the book with ISBN ${isbn} has been addded/updated`)
    } else {
        res.send('Unable to find this ISBN!')
    }
});

// delete book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let reviewer = req.session.authorization['username'];
    let filtered_review = books[isbn]["reviews"];
    if (filtered_review[reviewer]){
        delete filtered_review[reviewer];
        res.send(`Reviews for the ISBN  ${isbn} posted by the user ${reviewer} deleted.`);
    }
    else{
        res.send("Can't delete, as this review has been posted by a different user");
    }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
