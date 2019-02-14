var couchbase = require("nativescript-couchbase");

var couchbaseService = function() {
  this.db = new couchbase.Couchbase("testdb");
  this.db.createView("books", "1", function (document, emitter) {
    emitter.emit(document._id, document);
  });
}

couchbaseService.prototype.newBook = function(data) {
  var book = {
    _id: data._id ? data._id : null,
    title: data.title ? data.title : '',
    genre: data.genre ? data.genre : '',
    description: data.description ? data.description : '',
    publisher: data.publisher ? data.publisher : '',
    isbn: data.isbn ? data.isbn : '',
    binding_type: data.binding_type ? data.binding_type : '',
    price: data.price ? data.price : 0,
    date_added: data.date_added ? data.date_added : new Date().toJSON(),
  };
  // set book.authors
  book.authors = []
  if (data.authors) {
    data.authors.forEach(function(a) {
      if (a.name && a.name != '') {
        book.authors.push({
          name: a.name,
        });
      };
    });
  };
  return book;
};

couchbaseService.prototype.saveBook = function(bookRecord) {
  document = this.newBook(bookRecord);
  if (bookRecord._id) {
    try {
      this.db.updateDocument(bookRecord._id, document);
      var documentId = bookRecord._id;
    } catch (err) {
      console.warn('Record "' + bookRecord._id + '" (' +
        bookRecord.title + ') does not exist. Creating new document...');
      var documentId = this.db.createDocument(document, bookRecord._id);
    }
  } else {
    var documentId = this.db.createDocument(document);
  }
  return documentId;
};

couchbaseService.prototype.getBookList = function() {
  var bookList = [];
  var rows = this.db.executeQuery("books");
  for (var i = 0; i < rows.length; i++) {
    bookList.push(rows[i]);
  }
  return bookList;
}

couchbaseService.prototype.getBookDetail = function(documentId) {
  var document = this.db.getDocument(documentId);
  return document;
}

couchbaseService.prototype.deleteBook = function(documentId) {
  var isDeleted = this.db.deleteDocument(documentId);
  return isDeleted;
}

module.exports = new couchbaseService();
