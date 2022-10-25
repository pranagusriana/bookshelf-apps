const books = [];
const RENDER_EVENT = 'render-bookshelf';
const RENDER_EVENT_FILTERED = 'render-bookshelf-filtered';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function isStorageExist() {
    if (typeof(Storage) === undefined){
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}
function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}
function addBook() {
    const title = document.getElementById('inputBookTitle').value;
    const author = document.getElementById('inputBookAuthor').value; 
    const year = document.getElementById('inputBookYear').value;
    const isCompleted = document.getElementById('inputBookIsComplete').checked;

    const generatedID = generateId();
    const booksObject = generateBooksObject(generatedID, title, author, year, isCompleted);
    books.push(booksObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateBooksObject(id, title, author, year, isCompleted){
    return {
        id,
        title,
        author,
        year,
        isCompleted
    };
}

function makeBookshelf(booksObject){
    const textTitle = document.createElement('h3');
    textTitle.innerText = booksObject.title;

    const textPenulis = document.createElement('p');
    textPenulis.innerText = `Penulis: ${booksObject.author}`;

    const textYear = document.createElement('p');
    textYear.innerText = `Tahun: ${booksObject.year}`;


    const container = document.createElement('article');
    container.classList.add('book_item');
    container.classList.add('card');
    container.append(textTitle, textPenulis, textYear);
    container.setAttribute('id', `book-${booksObject.id}`);

    const btnContainer = document.createElement('div');
    btnContainer.classList.add('action');

    if (booksObject.isCompleted) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('green');
        undoButton.innerText = 'Belum Selesai Dibaca';

        undoButton.addEventListener('click', function(){
            undoBookFromCompleted(booksObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('red');
        trashButton.innerText = 'Hapus Buku';

        trashButton.addEventListener('click', function(){
            if(confirm('Affhkh kamu yakin mau menghapus buku?')){
                removeBookFromCompleted(booksObject.id);
            }
        });

        btnContainer.append(undoButton, trashButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('green');
        checkButton.innerText = 'Selesai Dibaca';

        checkButton.addEventListener('click', function(){
            addBookToCompleted(booksObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('red');
        trashButton.innerText = 'Hapus Buku';

        trashButton.addEventListener('click', function(){
            if(confirm('Affhkh kamu yakin mau menghapus buku?')){
                removeBookFromCompleted(booksObject.id);
            }
        });

        btnContainer.append(checkButton, trashButton);
    }

    container.append(btnContainer);

    return container;
}

function findBook(bookId) {
    for (const book of books) {
      if (book.id === bookId) {
        return book;
      }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in books) {
      if (books[index].id === bookId) {
        return index;
      }
    }
   
    return -1;
}

function addBookToCompleted (bookId) {
    const bookTarget = findBook(bookId);
   
    if (bookTarget == null) return;
   
    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBookFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);
   
    if (bookTarget === -1) return;
   
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);
   
    if (bookTarget == null) return;
   
    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
   
    if (data !== null) {
      for (const book of data) {
        books.push(book);
      }
    }
   
    document.dispatchEvent(new Event(RENDER_EVENT));
}


document.addEventListener('DOMContentLoaded', function(){
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function(event){
        event.preventDefault();
        addBook();
        event.target.reset();
    });
    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(RENDER_EVENT, function(){
    const incompleteBooksList = document.getElementById('incompleteBookshelfList');
    incompleteBooksList.innerHTML = '';

    const completeBooksList = document.getElementById('completeBookshelfList');
    completeBooksList.innerHTML = '';

    for (const book of books){
        const bookElement = makeBookshelf(book);
        if (!book.isCompleted) {
            incompleteBooksList.append(bookElement);
        } else{
            completeBooksList.append(bookElement);
        }
    }
});

document.addEventListener(RENDER_EVENT_FILTERED, function(){
    const incompleteBooksList = document.getElementById('incompleteBookshelfList');
    incompleteBooksList.innerHTML = '';

    const completeBooksList = document.getElementById('completeBookshelfList');
    completeBooksList.innerHTML = '';

    const searchBookValue = document.getElementById('searchBookTitle').value.toLowerCase();

    for (const book of books){
        const bookElement = makeBookshelf(book);
        if (!book.isCompleted) {
            if (searchBookValue) {
                if(book.title.toLowerCase().includes(searchBookValue)){
                    incompleteBooksList.append(bookElement);
                }
            } else {
                incompleteBooksList.append(bookElement);
            }
        } else{
            if (searchBookValue) {
                if(book.title.toLowerCase().includes(searchBookValue)){
                    completeBooksList.append(bookElement);
                }
            } else {
                completeBooksList.append(bookElement);
            }
        }
    }
});

document.getElementById('searchBook').addEventListener('submit', function (event){
    event.preventDefault();
    document.dispatchEvent(new Event(RENDER_EVENT_FILTERED));
});

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

document.getElementById('inputBookIsComplete').addEventListener('change', function() {
    if(document.getElementById('inputBookIsComplete').checked){
        document.getElementById('Info-Submit').innerText = 'Selesai Dibaca';
    } else{
        document.getElementById('Info-Submit').innerText = 'Belum Selesai Dibaca';
    }
})