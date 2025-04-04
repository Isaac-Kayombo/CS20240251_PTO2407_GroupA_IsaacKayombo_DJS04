import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'

let page = 1;
let matches = books

// CREATING HELPER FUNCTIONS FOR REUSABLE CODE

// FUNCTION TO RENDER BOOK PREVIEW
function renderBookPreview(book) {
    const element = document.createElement("button");
    element.classList = "preview";
    element.setAttribute("data-preview", book.id);
    element.innerHTML = `
        <img class="preview__image" src="${book.image}" />
        <div class="preview__info">
            <h3 class="preview__title">${book.title}</h3>
            <div class="preview__author">${authors[book.author]}</div>
        </div>
    `;
    return element;
}

// FUNCTION TO RENDER A LIST OF BOOKS
function renderBookList(bookArray) {
    const fragment = document.createDocumentFragment();
    for (const { author, id, image, title } of bookArray.slice(0, BOOKS_PER_PAGE)) {
        fragment.appendChild(renderBookPreview({ author, id, image, title }));
    }
    document.querySelector('[data-list-items]').appendChild(fragment);
}

// GENERALIZED FUNCTION TO RENDER DROPDOWN
function renderDropdown(options, containerSelector, firstOptionText) {
    const dropdownHtml = document.createDocumentFragment();

    // Create and appends first option
    const firstOption = document.createElement('option');
    firstOption.value = 'any';
    firstOption.innerText = firstOptionText;
    dropdownHtml.appendChild(firstOption);
    
    // Loops through the options and appends them
    for (const [id, name] of Object.entries(options)) {
        const optionElement = document.createElement('option');
        optionElement.value = id;
        optionElement.innerText = name;
        dropdownHtml.appendChild(optionElement);
    }
    // Appends dropdown to target container
    document.querySelector(containerSelector).appendChild(dropdownHtml);
}

// FUNCTION TO UPDATE THE "SHOW MORE" BUTTON TEXT AND STATUS
function updateShowMoreButton() {
    const remainingBooks = matches.length -(page * BOOKS_PER_PAGE);
    const showMoreButton = document.querySelector('[data-list-button]');
    showMoreButton.innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${remainingBooks > 0 ? remainingBooks : 0})</span>
    `;
    showMoreButton.disabled = remainingBooks <= 0;
}

// FUNCTION TO HANDLE SEARCH FILTERS
function applySearchFilters(filters) {
    const result = books.filter(book => 
        (filters.genre === 'any' || book.genres.includes(filters.genre)) &&
        (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
        (filters.author === 'any' || book.author === filters.author)
    );

    page = 1;
    matches = result;
    const listMessage = document.querySelector('[data-list-message]');
    listMessage.classList.toggle('list__message_show',result.lenght < 1)

    document.querySelector('[data-list-items]').innerHTML = '';
    renderBookList(result);

    updateShowMoreButton();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('[data-search-overlay]').open = false;
}



// EVENT LISTENERS SETUP
function setupEventListeners() {
    document.querySelector('[data-search-cancel]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = false
    })

    document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = false
    })

    // Search and settings overlay
    document.querySelector('[data-header-search]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = true 
        document.querySelector('[data-search-title]').focus()
    })

    document.querySelector('[data-header-settings]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = true 
    })
    
    document.querySelector('[data-list-close]').addEventListener('click', () => {
        document.querySelector('[data-list-active]').open = false
    })

    // Settings form submission
    document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
        event.preventDefault()
        const formData = new FormData(event.target)
        const { theme } = Object.fromEntries(formData)
    
        if (theme === 'night') {
            document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
            document.documentElement.style.setProperty('--color-light', '10, 10, 20');
        } else {
            document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
            document.documentElement.style.setProperty('--color-light', '255, 255, 255');
        }
        
        document.querySelector('[data-settings-overlay]').open = false
    })

    // Search form submission
    document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
        event.preventDefault()
        const formData = new FormData(event.target)
        const filters = Object.fromEntries(formData)
        applySearchFilters(filters);
    });

    // Show more button
    document.querySelector('[data-list-button]').addEventListener('click', () => {
        const fragment = document.createDocumentFragment();

        for (const { author, id, image, title } of matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)) {
            fragment.appendChild(renderBookPreview({ author, id, image, title }));
        }

        document.querySelector('[data-list-items]').appendChild(fragment);
        page += 1;
        updateShowMoreButton();
    });

    // Book preveiw click
    document.querySelector('[data-list-items]').addEventListener('click', (event) => {
        const pathArray = Array.from(event.path || event.composedPath());
        let active = null;

        for (const node of pathArray) {
            if (active) break;

            if (node?.dataset?.preview) {
                active = books.find(book => book.id === node?.dataset?.preview)
            }
        }

        if (active) {
            document.querySelector('[data-list-active]').open = true
            document.querySelector('[data-list-blur]').src = active.image
            document.querySelector('[data-list-image]').src = active.image
            document.querySelector('[data-list-title]').innerText = active.title
            document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`
            document.querySelector('[data-list-description]').innerText = active.description
        }
    });
}

// FUNCTION TO INITIALIZE THE APP
function initApp() {
    // Render books
    renderBookList(books);

    // Rendering genre and author dropdowns
    renderDropdown(genres, '[data-search-genres]','All Genres');
    renderDropdown(authors, '[data-search-authors]', 'All Authors');
    
    //Setup event listeners
    setupEventListeners();

    // Show more button
    updateShowMoreButton();
}
// RUN APP
initApp();