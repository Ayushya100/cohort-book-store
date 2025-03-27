let currentPage = 1;                                    // Stores Current page count
let totalPages = 1;                                     // Stores Total page count
let currentPageItems = 10;                              // Stores Number of items on current page
let totalItems = 10;                                    // Stores Number of items total available
let previousPage = false;                               // Stores info if previous page available
let nextPage = false;                                   // Stores info if next page available

const displayBooksRecord = [];                          // Stores total records loaded from API
let newBooksRecord = [];                                // Stores new records loaded from API

let isDataLoading = false;                              // Check to prevent multiple data loading
let currentViewSelection = '';                          // Stores current view type - list / grid
let isDetailsContainerOpen = false;                     // Check if book detail container open
let currentSetSort = '';                              // Stores current sort type - title / published date

const bgColors = [                                      // Stores the type of color decorations for cards
    'orange', 'green', 'blue', 'magenta', 'red'
];

// Document Selectors to manipulate DOM
const bookListContainer = document.getElementById('bookList');
const booksHeaderContainer = document.getElementById('booksHeader');
const booksListContainer = document.getElementById('booksList');
const booksCardContainer = document.getElementById('booksCard');
const booksCardWrapperContainer = document.getElementById('booksCardWrapper');
const searchContainer = document.getElementById('search');
const listGridContainer = document.querySelectorAll('.list-grid-val');
const titleSortContainer = document.getElementById('titleSort');
const dateSortContainer = document.getElementById('dateSort');
const recordCountContainer = document.getElementById('recordCount');
// Details Container
const dtlContainer = document.getElementById('dtlContainer');
const dtlPreviewContainer = document.getElementById('dtlPreview');
const dtlTitleContainer = document.getElementById('dtlTitle');
const dtlSubTitleContainer = document.getElementById('dtlSubTitle');
const dtlDescriptionContainer = document.getElementById('dtlDescription');
const dtlAuthorsContainer = document.getElementById('dtlAuthors');
const dtlPublisherContainer = document.getElementById('dtlPublisher');
const dtlPublisherDateContainer = document.getElementById('dtlPublisherDate');
const dtlPagesContainer = document.getElementById('dtlPages');
const dtlISBNContainer = document.getElementById('dtlISBN');
const dtlBookPreviewContainer = document.getElementById('dtlBookPreview');
const dtlBookDetailsContainer = document.getElementById('dtlBookDetails');
const closeBtnContainer = document.getElementById('closeBtn');

// Function to call an api and load the data in local variables in a memory
const loadBooks = async(pageNumber = 1) => {
    const api = `https://api.freeapi.app/api/v1/public/books?page=${pageNumber}`;
    const options = {method: 'GET', headers: {accept: 'application/json'}};

    try {
        const apiResponse = await fetch(api, options);
        let data = await apiResponse.json();
        data = data.data;
        
        // Page Detail
        currentPage = data.page;
        totalPages = data.totalPages;

        // Page Items
        currentPageItems = data.currentPageItems;
        totalItems = data.totalItems;

        // Is previous or next pages available
        previousPage = data.previousPage;
        nextPage = data.nextPage;

        // New book records
        newBooksRecord = data.data;
    } catch (err) {
        console.error(`Failed to load the data for books on requesting page number ${pageNumber}. Error: ${err}`);
    }
}

// Function to convert an array into a formatted string
const convertArrToStr = (arr) => {
    let result = '';

    if (arr && arr.length > 0) {
        for (let index = 0; index < arr.length; index++) {
            if (index === 0) {
                result = arr[index];
            } else {
                result += `, ${arr[index]}`;
            }
        }
    }
    return result;
}

// Toggle function show or hide details container in UI
const toggleDetailsContainer = () => {
    isDetailsContainerOpen = !isDetailsContainerOpen;
    
    if (isDetailsContainerOpen) {
        if (dtlContainer.classList.contains('dtl-hidden')) {
            dtlContainer.classList.remove('dtl-hidden');
        }
        dtlContainer.classList.add('dtl-show');
    } else {
        if (dtlContainer.classList.contains('dtl-show')) {
            dtlContainer.classList.remove('dtl-show');
        }
        dtlContainer.classList.add('dtl-hidden');
    }
}

// Event emitter function to be called when user clicks on book records to load book details
function loadBookDetails() {
    const selectedId = Number(this.getAttribute('id'));
    const bookRecord = displayBooksRecord.find(book => book.id === selectedId);

    const ISBN = bookRecord.industryIdentifiers.find(isbnData => isbnData.type === 'ISBN_13').identifier;

    dtlPreviewContainer.src = bookRecord.thumbnail;
    dtlTitleContainer.innerText = bookRecord.title;
    dtlSubTitleContainer.innerText = bookRecord.subtitle || null;
    dtlDescriptionContainer.innerText = bookRecord.description || null;
    dtlAuthorsContainer.innerText = bookRecord.authors;
    dtlPublisherContainer.innerText = bookRecord.publisher || null;
    dtlPublisherDateContainer.innerText = bookRecord.publisherDate || null;
    dtlPagesContainer.innerText = bookRecord.pageCount || null;
    dtlISBNContainer.innerText = ISBN || null;

    dtlBookPreviewContainer.href = bookRecord.previewLink;
    dtlBookDetailsContainer.href = bookRecord.infoLink;

    for (let i = 0; i < bgColors.length; i++) {
        if (dtlContainer.classList.contains(bgColors[i])) {
            dtlContainer.classList.remove(bgColors[i]);
        }
    }
    dtlContainer.classList.add(bgColors[(selectedId - 1) % 5]);

    toggleDetailsContainer();
}

// Function to display number of records shown in UI in page footer
const resetPageDetails = (customRecordsCount) => {
    const recordEndNum = currentPageItems * currentPage;

    if (customRecordsCount < recordEndNum) {
        recordCountContainer.innerText = `${customRecordsCount} of ${totalItems}`;
    } else {
        recordCountContainer.innerText = `1 - ${recordEndNum} of ${totalItems}`;
    }
}

// Function to build the book cards to display in the UI
const buildBookCard = (bookDtl, index) => {
    // Choose the type of card decoration for the card
    const color = bgColors[index % 5];

    if (currentViewSelection === 'list') {
        // Build HTML Structure to display list view
        const booksContainerDiv = document.createElement('div');
        booksContainerDiv.classList.add('books-record');
        booksContainerDiv.classList.add(color);
        booksContainerDiv.setAttribute('id', bookDtl.id);
    
        // Add event listener to the record
        booksContainerDiv.addEventListener('click', loadBookDetails);
    
        // Books list Record Structure
        booksContainerDiv.innerHTML = `
            <div class="book-portion">
                <div class="l-sml-thumbnail">
                    <img src="${bookDtl.smallThumbnail}" alt="" class="thumbnail">
                </div>
                <div class="title center">${bookDtl.title}</div>
                <div class="border-cls"></div>
                <div class="author center brd-pad">${bookDtl.authors || 'Not Known'}</div>
                <div class="border-cls"></div>
                <div class="publisher center brd-pad">${bookDtl.publisher || 'Not Known'}</div>
                <div class="border-cls"></div>
                <div class="published-date center brd-pad">${bookDtl.publisherDate || 'Not Known'}</div>
            </div>
        `;
        booksListContainer.appendChild(booksContainerDiv);
    } else {
        // Build HTML Structure to display grid view
        const booksCardDiv = document.createElement('div');
        booksCardDiv.classList.add('books-card');
        booksCardDiv.classList.add(color);
        booksCardDiv.setAttribute('id', bookDtl.id);
    
        // Add event listener to the record
        booksCardDiv.addEventListener('click', loadBookDetails);
    
        // Books Card Record Structure
        booksCardDiv.innerHTML = `
            <div class="c-sml-thumbnail">
                <img src="${bookDtl.smallThumbnail}" alt="" class="thumbnail">
                <div class="title">${bookDtl.title}</div>
            </div>
            <div class="book-detail">
                <div class="author card-text">Author: <span>${bookDtl.authors || 'Not Known'}</span></div>
                <div class="publisher card-text">Publisher: <span>${bookDtl.publisher || 'Not Known'}</span></div>
                <div class="published-date card-text">Publish Date: <span>${bookDtl.publisherDate || 'Not Known'}</span></div>
            </div>
        `;
        booksCardWrapperContainer.appendChild(booksCardDiv);
    }
}

// Function to load new books and display in UI
const loadNewBookRecords = async(pageNumber = 1) => {
    await loadBooks(pageNumber);

    newBooksRecord.forEach((book, index) => {
        const bookRecord = {};

        bookRecord.id = book.id;
        bookRecord.title = book.volumeInfo?.title;
        bookRecord.subtitle = book.volumeInfo?.subtitle;
        bookRecord.description = book.volumeInfo?.description;
        bookRecord.authors = book.volumeInfo.authors ? convertArrToStr(book.volumeInfo?.authors) : null;
        bookRecord.publisher = book.volumeInfo?.publisher;
        bookRecord.publisherDate = book.volumeInfo?.publishedDate;
        bookRecord.categories = book.volumeInfo?.categories;
        bookRecord.language = book.volumeInfo?.language;
        bookRecord.pageCount = book.volumeInfo?.pageCount;
        bookRecord.industryIdentifiers = book.volumeInfo?.industryIdentifiers;

        bookRecord.previewLink = book.volumeInfo?.previewLink;
        bookRecord.infoLink = book.volumeInfo?.infoLink;
        bookRecord.thumbnail = book.volumeInfo?.imageLinks?.thumbnail;
        bookRecord.smallThumbnail = book.volumeInfo?.imageLinks?.smallThumbnail;

        displayBooksRecord.push(bookRecord);
        buildBookCard(bookRecord, index);
    });

    resetPageDetails();
}

// Function to load and display the books in UI based on the search/sort or list/grid change
const loadExistingBooksBasedCondition = (booksArr, valueToCheck = '') => {
    booksListContainer.innerHTML = '';
    booksCardWrapperContainer.innerHTML = '';

    let recordsDisplayed = 0;

    booksArr.forEach((book, index) => {
        buildBookCard(book, index);
        recordsDisplayed++;
        isDataLoading = true;
    });

    if (!valueToCheck || valueToCheck.length === 0) {
        isDataLoading = false;
    }

    resetPageDetails(recordsDisplayed);
}

// Event emitter function to be called when user searches for the books by title or authors
function searchBook() {
    const valueToCheckWith = this.value.toLowerCase();

    const booksArrOnSearchCondition = displayBooksRecord.filter(book => 
        valueToCheckWith.length === 0 || book.title.toLowerCase().includes(valueToCheckWith) || book.authors.toLowerCase().includes(valueToCheckWith)
    );

    loadExistingBooksBasedCondition(booksArrOnSearchCondition, valueToCheckWith);
}

// Event emitter function to be called when scroller reaches bottom of the page
async function onScrollerReachBottom() {
    if (isDataLoading) return;

    const isReachedBottom = bookList.scrollTop + bookList.clientHeight >= bookList.scrollHeight - 5;

    if (isReachedBottom) {
        isDataLoading = true;

        if (currentPage < totalPages) {
            await loadNewBookRecords(currentPage + 1);
        }

        isDataLoading = false;
    }
}

// Event emitter function to be called when user clicks on List/Grid view button
function onClickView() {
    if (currentViewSelection !== this.getAttribute('value')) {
        listGridContainer.forEach(button => {
            if (button.getAttribute('value') === currentViewSelection) {
                button.classList.remove('active-btn');
                button.classList.add('inactive-btn');
            }
        });

        if (this.classList.contains('inactive-btn')) {
            this.classList.remove('inactive-btn');
        }
        this.classList.add('active-btn');

        // Reset the search bar value to null if user has any input
        searchContainer.value = '';

        if (this.getAttribute('value') === 'grid') {
            if (booksHeaderContainer.classList.contains('books-list')) {
                booksHeaderContainer.classList.remove('books-list');
            }
            booksHeaderContainer.classList.add('dtl-hidden');
            
            if (booksListContainer.classList.contains('books-list')) {
                booksListContainer.classList.remove('books-list');
            }
            booksListContainer.classList.add('dtl-hidden');

            if (booksCardContainer.classList.contains('dtl-hidden')) {
                booksCardContainer.classList.remove('dtl-hidden');
            }
            booksCardContainer.classList.add('books-list');
        } else {
            if (booksHeaderContainer.classList.contains('dtl-hidden')) {
                booksHeaderContainer.classList.remove('dtl-hidden');
            }
            
            if (booksListContainer.classList.contains('dtl-hidden')) {
                booksListContainer.classList.remove('dtl-hidden');
            }

            booksHeaderContainer.classList.add('books-list');
            booksListContainer.classList.add('books-list');

            if (booksCardContainer.classList.contains('books-list')) {
                booksCardContainer.classList.remove('books-list');
            }
            booksCardContainer.classList.add('dtl-hidden');
        }

        currentViewSelection = this.getAttribute('value');
        loadExistingBooksBasedCondition(displayBooksRecord);
    }
}

// Event emitter function to be called when user clicks on title or publish date sort
function onClickSort() {
    const selectedSortType = this.getAttribute('type');

    // Reset the search bar value to null if user has any input
    searchContainer.value = '';

    let dataToPrint = [];

    // Either Title or Date sorting will be active at a time
    if (selectedSortType === 'title') {
        // If the existing selection is title and user reclicks it, the sort operation should be removed
        // Else the data will be sorted by title
        if (currentSetSort === selectedSortType) {
            if (titleSortContainer.classList.contains('active-btn')) {
                titleSortContainer.classList.remove('active-btn');
            }
            titleSortContainer.classList.add('inactive-btn');
            currentSetSort = '';

            dataToPrint = displayBooksRecord;
        } else {
            if (titleSortContainer.classList.contains('inactive-btn')) {
                titleSortContainer.classList.remove('inactive-btn');
            }
            titleSortContainer.classList.add('active-btn');

            if (dateSortContainer.classList.contains('active-btn')) {
                dateSortContainer.classList.remove('active-btn');
            }
            dateSortContainer.classList.add('inactive-btn');

            currentSetSort = selectedSortType;

            dataToPrint = JSON.parse(JSON.stringify(displayBooksRecord))
                .sort((a, b) => a.title.localeCompare(b.title));
        }
    } else {
        // If the existing selection is publish date and user reclicks it, the sort operation should be removed
        // Else the data will be sorted by publish date
        if (currentSetSort === selectedSortType) {
            if (dateSortContainer.classList.contains('active-btn')) {
                dateSortContainer.classList.remove('active-btn');
            }
            dateSortContainer.classList.add('inactive-btn');
            currentSetSort = '';

            dataToPrint = displayBooksRecord;
        } else {
            if (dateSortContainer.classList.contains('inactive-btn')) {
                dateSortContainer.classList.remove('inactive-btn');
            }
            dateSortContainer.classList.add('active-btn');

            if (titleSortContainer.classList.contains('active-btn')) {
                titleSortContainer.classList.remove('active-btn');
            }
            titleSortContainer.classList.add('inactive-btn');

            currentSetSort = selectedSortType;

            dataToPrint = JSON.parse(JSON.stringify(displayBooksRecord))
                .sort((a, b) => new Date(a.publisherDate) - new Date(b.publisherDate));
        }
    }

    loadExistingBooksBasedCondition(dataToPrint);
}

// Function to initialize an event for searching a book based on user input
const initializeSearchBtnSelector = (initialAutoLoad) => {
    // The below code is to clear the text field in case of page reload
    if (initialAutoLoad) {
        searchContainer.value = '';
    }

    searchContainer.addEventListener('input', searchBook);
}

// Function to initialize an event for sorting the data based on title or publishing date
const initializeSortBtnSelector = () => {
    titleSortContainer.setAttribute('type', 'title');
    dateSortContainer.setAttribute('type', 'date');

    titleSortContainer.addEventListener('click', onClickSort);
    dateSortContainer.addEventListener('click', onClickSort);
}

// Function to initialize an event on clicking the list/grid view buttons
const initializeListGridSelector = () => {
    listGridContainer.forEach(button => {
        if ((!currentViewSelection || currentViewSelection.length === 0) && button.getAttribute('value') === 'list') {
            button.classList.add('active-btn');

            if (button.classList.contains('inactive-btn')) {
                button.classList.remove('inactive-btn');
            }
            currentViewSelection = button.getAttribute('value');
        }

        button.addEventListener('click', onClickView);
    });
}

// Function to initialize an event when scroller reached bottom of the page
const initializeScroller = () => {
    bookListContainer.addEventListener('scroll', onScrollerReachBottom);
}

// Function to initialize an event on close button
const initializeCloseBtnSelector = () => {
    closeBtnContainer.addEventListener('click', toggleDetailsContainer);
}

// Function to be called when user clicks on dropdown button to show/hide the options
const toggleDropdown = () => {
    let dropdown = document.getElementById('dropdownMenu');

    if (dropdown.classList.contains('dropdown-none')) {
        dropdown.classList.remove('dropdown-none');
        dropdown.classList.add('dropdown-show');
    } else {
        dropdown.classList.remove('dropdown-show');
        dropdown.classList.add('dropdown-none');
    }
}

// Immediate execution of functions on loading the script
loadNewBookRecords(1);
initializeScroller();
initializeSearchBtnSelector(true);
initializeListGridSelector();
initializeSortBtnSelector();
initializeCloseBtnSelector();
