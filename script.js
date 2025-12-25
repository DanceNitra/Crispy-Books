// Book Notes Application - JavaScript
// Main application logic for managing book notes with localStorage

// ==================== CONSTANTS & CONFIG ====================
const STORAGE_KEY = 'bookNotesApp';
const OPEN_LIBRARY_COVERS_API = 'https://covers.openlibrary.org/b/isbn/';
const DEFAULT_COVER_URL = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';

// ==================== STATE MANAGEMENT ====================
let books = [];
let currentBookId = null; // For editing
let sortBy = 'rating-desc';

// ==================== DOM ELEMENTS ====================
const elements = {
    // Containers
    booksContainer: document.getElementById('books-container'),
    emptyState: document.getElementById('empty-state'),
    
    // Stats
    totalBooks: document.getElementById('total-books'),
    avgRating: document.getElementById('avg-rating'),
    
    // Controls
    addBookBtn: document.getElementById('add-book-btn'),
    sortSelect: document.getElementById('sort-select'),
    
    // Modals
    bookModal: document.getElementById('book-modal'),
    confirmModal: document.getElementById('confirm-modal'),
    importModal: document.getElementById('import-modal'),
    
    // Book Form
    bookForm: document.getElementById('book-form'),
    modalTitle: document.getElementById('modal-title'),
    bookTitle: document.getElementById('book-title'),
    bookAuthor: document.getElementById('book-author'),
    bookIsbn: document.getElementById('book-isbn'),
    bookDate: document.getElementById('book-date'),
    bookRating: document.getElementById('book-rating'),
    bookNotes: document.getElementById('book-notes'),
    ratingStars: document.querySelectorAll('.rating-input .star'),
    
    // Buttons
    closeModal: document.getElementById('close-modal'),
    cancelBtn: document.getElementById('cancel-btn'),
    saveBtn: document.getElementById('save-btn'),
    exportBtn: document.getElementById('export-btn'),
    importBtn: document.getElementById('import-btn'),
    clearBtn: document.getElementById('clear-btn'),
    
    // Confirm Modal
    confirmTitle: document.getElementById('confirm-title'),
    confirmMessage: document.getElementById('confirm-message'),
    confirmCancel: document.getElementById('confirm-cancel'),
    confirmOk: document.getElementById('confirm-ok'),
    
    // Import Modal
    closeImportModal: document.getElementById('close-import-modal'),
    cancelImport: document.getElementById('cancel-import'),
    importDataBtn: document.getElementById('import-data-btn'),
    importData: document.getElementById('import-data'),
    
    // Footer
    currentYear: document.getElementById('current-year')
};

// ==================== UTILITY FUNCTIONS ====================
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function getCoverUrl(isbn) {
    if (isbn && isbn.trim() !== '') {
        return `${OPEN_LIBRARY_COVERS_API}${isbn.trim()}-M.jpg`;
    }
    return DEFAULT_COVER_URL;
}

function calculateStats() {
    const total = books.length;
    const avg = total > 0 
        ? (books.reduce((sum, book) => sum + book.rating, 0) / total).toFixed(1)
        : '0.0';
    
    elements.totalBooks.textContent = total;
    elements.avgRating.textContent = avg;
    
    // Show/hide empty state
    elements.emptyState.style.display = total === 0 ? 'block' : 'none';
}

function renderStars(rating) {
    return Array(5).fill(0).map((_, i) => 
        `<i class="fas fa-star${i < rating ? '' : '-half-alt'}"></i>`
    ).join('');
}

// ==================== LOCALSTORAGE FUNCTIONS ====================
function loadBooks() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        try {
            books = JSON.parse(data);
            // Ensure each book has an id (for backward compatibility)
            books.forEach(book => {
                if (!book.id) book.id = generateId();
                if (!book.createdAt) book.createdAt = new Date().toISOString();
            });
        } catch (error) {
            console.error('Error loading books from localStorage:', error);
            books = [];
        }
    } else {
        books = [];
    }
    sortBooks();
    renderBooks();
    calculateStats();
}

function saveBooks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
        sortBooks();
        renderBooks();
        calculateStats();
    } catch (error) {
        console.error('Error saving books to localStorage:', error);
        alert('Error saving data. Your browser storage might be full.');
    }
}

// ==================== BOOK CRUD OPERATIONS ====================
function addBook(bookData) {
    const newBook = {
        id: generateId(),
        ...bookData,
        createdAt: new Date().toISOString()
    };
    books.push(newBook);
    saveBooks();
    showNotification('Book added successfully!', 'success');
}

function updateBook(id, bookData) {
    const index = books.findIndex(book => book.id === id);
    if (index !== -1) {
        books[index] = { ...books[index], ...bookData };
        saveBooks();
        showNotification('Book updated successfully!', 'success');
        return true;
    }
    return false;
}

function deleteBook(id) {
    const index = books.findIndex(book => book.id === id);
    if (index !== -1) {
        books.splice(index, 1);
        saveBooks();
        showNotification('Book deleted successfully!', 'success');
        return true;
    }
    return false;
}

function getBookById(id) {
    return books.find(book => book.id === id);
}

// ==================== SORTING FUNCTIONS ====================
function sortBooks() {
    switch (sortBy) {
        case 'rating-desc':
            books.sort((a, b) => b.rating - a.rating);
            break;
        case 'date-desc':
            books.sort((a, b) => new Date(b.dateRead) - new Date(a.dateRead));
            break;
        case 'date-asc':
            books.sort((a, b) => new Date(a.dateRead) - new Date(b.dateRead));
            break;
        case 'title-asc':
            books.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            books.sort((a, b) => b.title.localeCompare(a.title));
            break;
    }
}

// ==================== RENDERING FUNCTIONS ====================
function renderBooks() {
    if (books.length === 0) {
        elements.booksContainer.innerHTML = elements.emptyState.outerHTML;
        return;
    }
    
    const booksHTML = books.map(book => `
        <div class="book-card" data-id="${book.id}">
            <div class="book-cover">
                <img src="${book.coverUrl || getCoverUrl(book.isbn)}" 
                     alt="${book.title}" 
                     onerror="this.src='${DEFAULT_COVER_URL}'">
                <div class="book-cover-overlay"></div>
            </div>
            <div class="book-content">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                
                <div class="book-meta">
                    <div class="book-rating">
                        ${renderStars(book.rating)}
                        <span class="rating-text">${book.rating}/5</span>
                    </div>
                    <div class="book-date">
                        <i class="far fa-calendar"></i>
                        ${formatDate(book.dateRead)}
                    </div>
                </div>
                
                <div class="book-notes">
                    ${book.notes || '<em>No notes provided</em>'}
                </div>
                
                <div class="book-actions">
                    <button class="btn btn-secondary edit-btn" data-id="${book.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger delete-btn" data-id="${book.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    elements.booksContainer.innerHTML = booksHTML;
    
    // Re-attach event listeners to the new buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            openEditModal(id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            confirmDelete(id);
        });
    });
}

// ==================== MODAL FUNCTIONS ====================
function openAddModal() {
    currentBookId = null;
    elements.modalTitle.textContent = 'Add New Book';
    elements.bookForm.reset();
    elements.bookDate.value = new Date().toISOString().split('T')[0];
    elements.bookRating.value = '3';
    
    // Reset stars to default (3 stars)
    elements.ratingStars.forEach((star, index) => {
        if (index < 3) {
            star.classList.add('active');
            star.querySelector('i').className = 'fas fa-star';
        } else {
            star.classList.remove('active');
            star.querySelector('i').className = 'far fa-star';
        }
    });
    
    elements.bookModal.classList.add('active');
    elements.bookTitle.focus();
}

function openEditModal(id) {
    const book = getBookById(id);
    if (!book) return;
    
    currentBookId = id;
    elements.modalTitle.textContent = 'Edit Book';
    
    // Fill form with book data
    elements.bookTitle.value = book.title;
    elements.bookAuthor.value = book.author;
    elements.bookIsbn.value = book.isbn || '';
    elements.bookDate.value = book.dateRead;
    elements.bookRating.value = book.rating;
    elements.bookNotes.value = book.notes || '';
    
    // Set stars
    elements.ratingStars.forEach((star, index) => {
        if (index < book.rating) {
            star.classList.add('active');
            star.querySelector('i').className = 'fas fa-star';
        } else {
            star.classList.remove('active');
            star.querySelector('i').className = 'far fa-star';
        }
    });
    
    elements.bookModal.classList.add('active');
    elements.bookTitle.focus();
}

function closeBookModal() {
    elements.bookModal.classList.remove('active');
    currentBookId = null;
}

function handleBookSubmit(e) {
    e.preventDefault();
    
    const bookData = {
        title: elements.bookTitle.value.trim(),
        author: elements.bookAuthor.value.trim(),
        isbn: elements.bookIsbn.value.trim(),
        dateRead: elements.bookDate.value,
        rating: parseInt(elements.bookRating.value),
        notes: elements.bookNotes.value.trim(),
        coverUrl: getCoverUrl(elements.bookIsbn.value.trim())
    };
    
    // Validation
    if (!bookData.title || !bookData.author || !bookData.dateRead) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    if (bookData.rating < 1 || bookData.rating > 5) {
        showNotification('Rating must be between 1 and 5.', 'error');
        return;
    }
    
    if (currentBookId) {
        updateBook(currentBookId, bookData);
    } else {
        addBook(bookData);
    }
    
    closeBookModal();
}

// ==================== CONFIRMATION MODAL ====================
let pendingAction = null;

function confirmDelete(id) {
    const book = getBookById(id);
    if (!book) return;
    
    elements.confirmTitle.textContent = 'Delete Book';
    elements.confirmMessage.textContent = `Are you sure you want to delete "${book.title}" by ${book.author}? This action cannot be undone.`;
    
    pendingAction = () => {
        deleteBook(id);
        closeConfirmModal();
    };
    
    elements.confirmModal.classList.add('active');
}

function confirmClearAll() {
    if (books.length === 0) {
        showNotification('No books to clear.', 'info');
        return;
    }
    
    elements.confirmTitle.textContent = 'Clear All Books';
    elements.confirmMessage.textContent = `Are you sure you want to delete all ${books.length} books? This action cannot be undone.`;
    
    pendingAction = () => {
        books = [];
        saveBooks();
        showNotification('All books cleared successfully!', 'success');
        closeConfirmModal();
    };
    
    elements.confirmModal.classList.add('active');
}

function closeConfirmModal() {
    elements.confirmModal.classList.remove('active');
    pendingAction = null;
}

// ==================== IMPORT/EXPORT FUNCTIONS ====================
function exportData() {
    if (books.length === 0) {
        showNotification('No books to export.', 'info');
        return;
    }
    
    const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        books: books
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `book-notes-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Data exported successfully!', 'success');
}

function openImportModal() {
    elements.importData.value = '';
    elements.importModal.classList.add('active');
}

function closeImportModal() {
    elements.importModal.classList.remove('active');
}

function importData() {
    try {
        const data = JSON.parse(elements.importData.value);
        
        // Validate data structure
        if (!data.books || !Array.isArray(data.books)) {
            throw new Error('Invalid data format. Expected an array of books.');
        }
        
        // Validate each book
        const validBooks = data.books.filter(book => 
            book.title && book.author && book.dateRead && book.rating
        );
        
        if (validBooks.length === 0) {
            throw new Error('No valid books found in the imported data.');
        }
        
        // Add imported books (with new IDs to avoid conflicts)
        validBooks.forEach(book => {
            book.id = generateId();
            book.createdAt = book.createdAt || new Date().toISOString();
            if (!book.coverUrl && book.isbn) {
                book.coverUrl = getCoverUrl(book.isbn);
            }
        });
        
        books = [...books, ...validBooks];
        saveBooks();
        closeImportModal();
        showNotification(`Successfully imported ${validBooks.length} books!`, 'success');
        
    } catch (error) {
        showNotification(`Import failed: ${error.message}`, 'error');
    }
}

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: var(--border-radius);
                color: white;
                font-weight: 500;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                min-width: 300px;
                max-width: 400px;
                z-index: 2000;
                animation: slideIn 0.3s ease;
                box-shadow: var(--box-shadow-hover);
            }
            .notification-success { background-color: var(--success-color); }
            .notification-error { background-color: var(--danger-color); }
            .notification-info { background-color: var(--primary-color); }
            .notification-warning { background-color: var(--warning-color); }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                line-height: 1;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// ==================== EVENT LISTENERS ====================
function initEventListeners() {
    // Add book button
    elements.addBookBtn.addEventListener('click', openAddModal);
    
    // Sort select
    elements.sortSelect.addEventListener('change', (e) => {
        sortBy = e.target.value;
        sortBooks();
        renderBooks();
    });
    
    // Book form
    elements.bookForm.addEventListener('submit', handleBookSubmit);
    
    // Modal close buttons
    elements.closeModal.addEventListener('click', closeBookModal);
    elements.cancelBtn.addEventListener('click', closeBookModal);
    
    // Rating stars interaction
    elements.ratingStars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.getAttribute('data-value'));
            elements.bookRating.value = rating;
            
            // Update star display
            elements.ratingStars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('active');
                    s.querySelector('i').className = 'fas fa-star';
                } else {
                    s.classList.remove('active');
                    s.querySelector('i').className = 'far fa-star';
                }
            });
        });
    });
    
    // Export/Import buttons
    elements.exportBtn.addEventListener('click', exportData);
    elements.importBtn.addEventListener('click', openImportModal);
    elements.clearBtn.addEventListener('click', confirmClearAll);
    
    // Confirm modal buttons
    elements.confirmCancel.addEventListener('click', closeConfirmModal);
    elements.confirmOk.addEventListener('click', () => {
        if (pendingAction) {
            pendingAction();
        }
    });
    
    // Import modal buttons
    elements.closeImportModal.addEventListener('click', closeImportModal);
    elements.cancelImport.addEventListener('click', closeImportModal);
    elements.importDataBtn.addEventListener('click', importData);
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === elements.bookModal) {
            closeBookModal();
        }
        if (e.target === elements.confirmModal) {
            closeConfirmModal();
        }
        if (e.target === elements.importModal) {
            closeImportModal();
        }
    });
    
    // Set current year in footer
    elements.currentYear.textContent = new Date().getFullYear();
}

// ==================== INITIALIZATION ====================
function init() {
    // Load books from localStorage
    loadBooks();
    
    // Initialize event listeners
    initEventListeners();
    
    // Set default date to today
    elements.bookDate.value = new Date().toISOString().split('T')[0];
    
    // Show welcome notification if first time
    if (!localStorage.getItem(STORAGE_KEY)) {
        setTimeout(() => {
            showNotification('Welcome to Book Notes! Start by adding your first book.', 'info');
        }, 1000);
        
        // Add sample books for demonstration (optional)
        addSampleBooks();
    }
}

// Add sample books for demonstration
function addSampleBooks() {
    const sampleBooks = [
        {
            title: "Atomic Habits",
            author: "James Clear",
            isbn: "9780735211292",
            rating: 5,
            dateRead: "2024-01-15",
            notes: "Tiny changes, remarkable results. Focus on systems rather than goals.",
            coverUrl: "https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg"
        },
        {
            title: "Deep Work",
            author: "Cal Newport",
            isbn: "9781455586691",
            rating: 4,
            dateRead: "2024-02-20",
            notes: "Rules for focused success in a distracted world. Quality of work = time spent × intensity of focus.",
            coverUrl: "https://covers.openlibrary.org/b/isbn/9781455586691-M.jpg"
        },
        {
            title: "The Psychology of Money",
            author: "Morgan Housel",
            isbn: "9780857197689",
            rating: 5,
            dateRead: "2023-11-10",
            notes: "Timeless lessons on wealth, greed, and happiness. Doing well with money has little to do with how smart you are.",
            coverUrl: "https://covers.openlibrary.org/b/isbn/9780857197689-M.jpg"
        },
        {
            title: "Thinking, Fast and Slow",
            author: "Daniel Kahneman",
            isbn: "9780374275631",
            rating: 4,
            dateRead: "2023-09-05",
            notes: "System 1 (fast, intuitive) vs System 2 (slow, deliberate) thinking. Cognitive biases affect our decisions.",
            coverUrl: "https://covers.openlibrary.org/b/isbn/9780374275631-M.jpg"
        },
        {
            title: "Sapiens: A Brief History of Humankind",
            author: "Yuval Noah Harari",
            isbn: "9780062316097",
            rating: 5,
            dateRead: "2023-12-30",
            notes: "How Homo sapiens became Earth's dominant species through cognitive, agricultural, and scientific revolutions.",
            coverUrl: "https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg"
        }
    ];
    
    // Add sample books with a delay for visual effect
    sampleBooks.forEach((book, index) => {
        setTimeout(() => {
            addBook(book);
        }, index * 300); // Stagger the additions
    });
    
    setTimeout(() => {
        showNotification('Sample books added for demonstration! Feel free to edit or delete them.', 'info');
    }, sampleBooks.length * 300 + 500);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
