const { BookSearchApiClient } = require('./BookSearchApiClient');

const client = new BookSearchApiClient('http://api.book-seller-example.com', 'json');

client.getBooksByAuthor('Shakespeare', 10)
  .then((books) => console.log(books))
  .catch((error) => {
    alert(`Error fetching books: ${error.message}`);
  });


// Functional client example

fetchBooksByAuthor({
  baseURL: 'http://api.book-seller-example.com',
  authorName: 'Shakespeare',
  limit: 10,
  format: 'json',
})
  .then((books) => {
    console.log('Functional client Result:');
    console.log(books);
  })
  .catch((error) => {
    console.error('Functional client Error:', error.message);
  });
