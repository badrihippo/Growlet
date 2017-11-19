var couchbase = require("nativescript-couchbase");

var couchbaseService = function() {
  this.db = new couchbase.Couchbase("testdb");
  this.db.createView("books", "1", function (document, emitter) {
    emitter.emit(document._id, document);
  });
}

couchbaseService.prototype.saveBook = function(bookRecord) {
  if (bookRecord._id) {
    var documentId = this.db.updateDocument(bookRecord._id, {
      title: bookRecord.title,
      authors: bookRecord.authors,
      genre: bookRecord.genre,
      description: bookRecord.description,
      publisher: bookRecord.publisher,
      isbn: bookRecord.isbn,
      binding_type: bookRecord.binding_type,
      price: bookRecord.price,
      date_added: bookRecord.date_added,
    });
  } else {
    var document = db.createDocument({
      title: bookRecord.title,
      authors: bookRecord.authors,
      genre: bookRecord.genre,
      description: bookRecord.description,
      publisher: bookRecord.publisher,
      isbn: bookRecord.isbn,
      binding_type: bookRecord.binding_type,
      price: bookRecord.price,
      date_added: bookRecord.date_added,
    });
  }
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

module.exports = new couchbaseService();
