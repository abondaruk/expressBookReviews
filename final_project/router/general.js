const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) { 
          users.push({"username":username,"password":password});
          return res.status(200).json({message: "Customer successfully registred. Now you can login"});
        } else {
          return res.status(404).json({message: "Customer with same username already exists!"});    
        }
      } 
      return res.status(404).json({message: "Unable to register customer."});
});

// Get the book list available in the shop
// public_users.get('/',function (req, res) {
//     res.send(JSON.stringify(books, null, 4));
// });

// promise or async await function book in the shop - task 10
public_users.get('/', async function (req, res) {
    try {
        const response = await axios.get('http://localhost:5000/');
        const books = response.data;
        res.send(JSON.stringify(books, null, 5));
    } catch(error) {
        console.error('Error retrieving books', error);
        res.status(500).send('Internal server error');
    }
});

// Get book details based on ISBN
// public_users.get('/isbn/:isbn',function (req, res) {
//     const isbn = req.params.isbn;
//     res.send(books[isbn]);
// });

// promise or async await function book on ISBN number - task 11
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = parseInt(req.params.isbn);
    try {
      const response = await axios.get('http://localhost:5000/isbn/:isbn');
      const book = response.data;
  
      if (book) {
        res.status(200).json(book);
  
      }else {
      res.status(404).json({ message: "Book not found" });
      }
    } catch (error) {
      console.error('Error retrieving books by isbn', error);
      res.status(500).send('Internal server error');
    }
});
  
// Get book details based on author
// public_users.get('/author/:author',function (req, res) {
//     let booksbyauthor = [];
//     let isbns = Object.keys(books);
//     isbns.forEach((isbn) => {
//     if(books[isbn]["author"] === req.params.author) {
//       booksbyauthor.push({"isbn":isbn,
//                           "title":books[isbn]["title"],
//                           "reviews":books[isbn]["reviews"]});
//     }
//   });
//   res.send(JSON.stringify({booksbyauthor}, null, 4));
// });

// promise or async await function book on author details - task 12
public_users.get('/author/:author', async function(req, res) {
    let authorName = req.params.author
    let matchingBooks = [];
  
    try {
      await Promise.all(Object.keys(books).map(async key => {
        const book = books[key];
        if(book.author === authorName){
          const response = await axios.get('http://localhost:5000/author/${authorName}');
          matchingBooks.push(response.data);
        }
    }
  ));
  
  if (matchingBooks.length > 0) {
    res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: "Author not found" });
    }
  }   catch (error) {
    console.error('fetching book by author:', error);
    res.status(500).send('Internal server error');
}});

// Get all books based on title
// public_users.get('/title/:title',function (req, res) {
//     let booksbytitle = [];
//     let isbns = Object.keys(books);
//     isbns.forEach((isbn) => {
//     if(books[isbn]["title"] === req.params.title) {
//       booksbytitle.push({"isbn":isbn,
//                           "author":books[isbn]["author"],
//                           "reviews":books[isbn]["reviews"]});
//     }
//   });
//   res.send(JSON.stringify({booksbytitle}, null, 4));
// });

// promise or async await function book on title details - task 13
public_users.get('/title/:title', async function (req, res) {
    const titleName = req.params.title;
    const matchingTitleBooks = [];
  
    try {
      // Using async-await
      await Promise.all(Object.keys(books).map(async key => {
        const book = books[key];
        if (book.title === titleName) {
          const response = await axios.get(`http://localhost:5000/title/${titleName}`);
          matchingTitleBooks.push(response.data);
        }
      }));
  
      if (matchingTitleBooks.length > 0) {
        res.status(200).json(matchingTitleBooks);
      } else {
        res.status(404).json({ message: "Title not found" });
      }
    } catch (error) {
      console.error('Error fetching books by title:', error);
      res.status(500).send('Internal Server Error');
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const reviews = books[isbn]["reviews"];

    res.send(JSON.stringify(reviews));
});

module.exports.general = public_users;
