# Book Notes - Personal Reading Library

A modern, browser-based application for tracking books you've read, inspired by Derek Sivers' book website (sive.rs/book). Store your book notes, ratings, and insights locally in your browser.

## Features

- **📚 Book Management**: Add, edit, and delete book entries
- **⭐ Rating System**: 5-star rating with visual feedback
- **📅 Date Tracking**: Record when you read each book
- **📝 Notes**: Capture key takeaways and insights
- **🖼️ Book Covers**: Automatic cover fetching from Open Library API using ISBN
- **🔍 Sorting**: Sort books by rating, date, or title
- **📊 Statistics**: View total books and average rating
- **💾 Data Persistence**: All data stored locally in browser localStorage
- **📤 Export/Import**: Backup and restore your book data
- **🎨 Modern UI**: Clean, responsive design with smooth animations

## How to Use

### Getting Started
1. Open `index.html` in your web browser
2. The application will load with a welcome message
3. Start by clicking "Add New Book" to add your first book

### Adding a Book
1. Click the "Add New Book" button
2. Fill in the required information:
   - **Title**: Book title (required)
   - **Author**: Book author (required)
   - **ISBN**: Optional - used to fetch book cover automatically
   - **Date Read**: When you finished the book (required)
   - **Rating**: Click stars to rate (1-5)
   - **Notes**: Key takeaways or memorable quotes
3. Click "Save Book" to add it to your library

### Managing Books
- **Edit**: Click the "Edit" button on any book card
- **Delete**: Click the "Delete" button on any book card
- **Sort**: Use the dropdown to sort by rating, date, or title

### Data Management
- **Export**: Click "Export Data" to download a JSON backup
- **Import**: Click "Import Data" to restore from a JSON backup
- **Clear All**: Remove all books (use with caution!)

## Technical Details

### Technology Stack
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with CSS Grid, Flexbox, and CSS Variables
- **JavaScript (ES6+)**: Vanilla JavaScript with no frameworks
- **localStorage**: Browser-based data persistence
- **Open Library Covers API**: For fetching book covers

### Data Structure
Books are stored in localStorage with the following structure:
```javascript
{
  "books": [
    {
      "id": "unique-id",
      "title": "Book Title",
      "author": "Author Name",
      "isbn": "optional-isbn",
      "rating": 5,
      "notes": "Key takeaways...",
      "dateRead": "2024-12-25",
      "coverUrl": "https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg",
      "createdAt": "timestamp"
    }
  ]
}
```

### API Integration
The application uses the Open Library Covers API:
- URL format: `https://covers.openlibrary.org/b/isbn/{ISBN}-M.jpg`
- Fallback to a default book cover image if no ISBN provided
- Images are loaded with error handling for missing covers

## Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- Opera 47+

## Project Structure
```
Booknotes/
├── index.html          # Main HTML file
├── style.css          # All CSS styles
├── script.js          # Main JavaScript application
├── README.md          # This documentation
└── (assets)           # No external assets required
```

## Development

### Running Locally
Simply open `index.html` in any modern web browser. No server or build process required.

### Customization
- Modify CSS variables in `style.css` to change colors, spacing, etc.
- Update constants in `script.js` to change default settings
- Add new sorting options in the `sortBooks()` function

### Future Enhancements
Potential features for future development:
- Search/filter functionality
- Categories/tags for books
- Reading progress tracking
- Dark/light mode toggle
- Social sharing
- Goodreads integration

## Credits
- Inspired by [Derek Sivers' book notes](https://sive.rs/book)
- Book covers from [Open Library](https://openlibrary.org/)
- Icons from [Font Awesome](https://fontawesome.com/)
- Fonts from [Google Fonts](https://fonts.google.com/)
- Default book cover image from [Unsplash](https://unsplash.com/)

## License
This project is open source and available for personal and educational use.

## Support
For issues or questions:
1. Check the browser console for errors
2. Ensure you're using a modern browser
3. Clear browser cache if experiencing issues
4. Export your data regularly as a backup

---

**Happy Reading!** 📚✨
