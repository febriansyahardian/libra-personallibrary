class LibraLibrary {
    constructor() {
        this.books = [];
        this.supabase = null;
        this.userId = null;
        this.currentFilters = {
            status: 'all',
            genre: 'all',
            search: ''
        };
        this.init();
    }

    async init() {
        // Initialize Supabase if configured
        this.initSupabase();
        await this.loadBooks();
        this.initRealtime();
        this.setupEventListeners();
        this.renderBooks();
        this.updateCounts();
    }

    initSupabase() {
        try {
            const cfg = window.LIBRA_CONFIG || {};
            if (window.supabase && cfg.supabaseUrl && cfg.supabaseAnonKey) {
                this.supabase = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
                this.userId = cfg.userId || null;
            }
        } catch (e) {
            console.warn('Supabase init skipped:', e);
        }
    }

    initRealtime() {
        try {
            if (!this.supabase) return;
            // Subscribe to changes in the books table
            this.supabase
                .channel('books-changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'books' }, (payload) => {
                    // Simple strategy: re-fetch books on any change
                    this.loadBooks().then(() => {
                        this.renderBooks();
                        this.updateCounts();
                    });
                })
                .subscribe();
        } catch (e) {
            console.warn('Realtime init skipped:', e);
        }
    }

    async loadBooks() {
        try {
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('books')
                    .select('*')
                    .order('addedDate', { ascending: true });
                if (error) throw error;
                this.books = Array.isArray(data) ? data : [];
                return;
            }

            // No Supabase configured: start empty (no localStorage fallback)
            this.books = [];
            console.warn('Supabase not configured. Data will not persist across sessions.');
        } catch (error) {
            console.error('Error loading books:', error);
            this.showToast('Error loading books', 'error');
        }
    }

    // Removed localStorage caching; persistence handled by Supabase

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', this.debounce((e) => {
            this.currentFilters.search = e.target.value;
            this.renderBooks();
        }, 300));

        // Filter buttons
        document.querySelectorAll('[data-filter]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.updateFilterButtons(e.target);
                this.currentFilters.status = e.target.dataset.filter;
                this.renderBooks();
            });
        });

        // Genre filter
        const genreFilter = document.getElementById('genreFilter');
        genreFilter.addEventListener('change', (e) => {
            this.currentFilters.genre = e.target.value;
            this.renderBooks();
        });

        // Add book modal
        const addBookBtn = document.getElementById('addBookBtn');
        const addBookModal = document.getElementById('addBookModal');
        const closeModal = document.getElementById('closeModal');
        const cancelAdd = document.getElementById('cancelAdd');

        addBookBtn.addEventListener('click', () => {
            addBookModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });

        [closeModal, cancelAdd].forEach(btn => {
            btn.addEventListener('click', () => {
                addBookModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
                document.getElementById('addBookForm').reset();
                this.removeImagePreview();
            });
        });

        // Close modal on backdrop click
        addBookModal.addEventListener('click', (e) => {
            if (e.target === addBookModal) {
                addBookModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        });

        // Add book form
        const addBookForm = document.getElementById('addBookForm');
        addBookForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addBook();
        });

        // Book details modal
        const bookDetailsModal = document.getElementById('bookDetailsModal');
        const closeDetailsModal = document.getElementById('closeDetailsModal');
        
        closeDetailsModal.addEventListener('click', () => {
            bookDetailsModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        });

        // Close details modal on backdrop click
        bookDetailsModal.addEventListener('click', (e) => {
            if (e.target === bookDetailsModal) {
                bookDetailsModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        });  
        
        // Prevent close when clicking inside modals
        document.querySelectorAll('.glass-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }); 
        // Close details modal on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape" && !bookDetailsModal.classList.contains('hidden')) {
                bookDetailsModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        });

    }

        

    updateFilterButtons(activeButton) {
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.classList.remove('filter-active');
            btn.classList.add('filter-inactive');
        });
        activeButton.classList.remove('filter-inactive');
        activeButton.classList.add('filter-active');
    }

    async addBook() {
        const formData = new FormData(document.getElementById('addBookForm'));
        const bookData = {
            title: formData.get('title') || document.getElementById('bookTitle').value,
            author: formData.get('author') || document.getElementById('bookAuthor').value,
            genre: document.getElementById('bookGenre').value,
            description: document.getElementById('bookDescription').value
        };

        // Handle cover image (file upload or URL)
        const coverSource = this.getCoverSource();
        if (coverSource) {
            if (coverSource instanceof File) {
                // Convert file to data URL for storage
                const reader = new FileReader();
                reader.onload = (e) => {
                    bookData.cover = e.target.result;
                    this.submitBook(bookData);
                };
                reader.readAsDataURL(coverSource);
                return; // Exit early, will continue in callback
            } else {
                // URL input
                bookData.cover = coverSource;
            }
        }

        // Submit book immediately if no file processing needed
        this.submitBook(bookData);
    }

    async submitBook(bookData) {
        try {
            // Create new book object
            const newBook = {
                id: Date.now(),
                title: bookData.title,
                author: bookData.author,
                cover: bookData.cover || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=400&h=600&fit=crop`,
                status: 'to-read',
                genre: bookData.genre || 'General',
                description: bookData.description || 'No description available.',
                addedDate: new Date().toISOString().split('T')[0]
            };

            // Remote first if available
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('books')
                    .insert(newBook)
                    .select();
                if (error) throw error;
                // Prefer server-returned row to avoid mismatch
                const inserted = Array.isArray(data) && data[0] ? data[0] : newBook;
                this.books.push(inserted);
            } else {
                // No persistence, still update UI state
                this.books.push(newBook);
            }
            
            // Update UI
            this.renderBooks();
            this.updateCounts();
            this.showToast('Book added successfully!');
            
            // Close modal
            document.getElementById('addBookModal').classList.add('hidden');
            document.body.style.overflow = 'auto';
            document.getElementById('addBookForm').reset();
            
            // Clear image preview
            this.removeImagePreview();
        } catch (error) {
            console.error('Error adding book:', error);
            this.showToast('Error adding book', 'error');
        }
    }

    async toggleBookStatus(bookId, currentStatus) {
        let newStatus;
        if (currentStatus === 'to-read') {
            newStatus = 'ongoing';
        } else if (currentStatus === 'ongoing') {
            newStatus = 'read';
        } else {
            newStatus = 'to-read';
        }
        
        try {
            // Update local state
            const bookIndex = this.books.findIndex(book => book.id === bookId);
            if (bookIndex !== -1) {
                this.books[bookIndex].status = newStatus;
                
                // Remote update if available
                if (this.supabase) {
                    const { error } = await this.supabase
                        .from('books')
                        .update({ status: newStatus })
                        .eq('id', bookId);
                    if (error) throw error;
                }
                // No localStorage persistence
                
                // Update UI
                this.renderBooks();
                this.updateCounts();
                this.showToast(`Book marked as ${newStatus === 'to-read' ? 'to-read' : newStatus === 'ongoing' ? 'ongoing read' : 'read'}!`);
            }
        } catch (error) {
            console.error('Error updating book status:', error);
            this.showToast('Error updating book status', 'error');
        }
    }

    async toggleBookStatusAndCloseModal(bookId, currentStatus) {
        try {
            // Close modal first to prevent UI freeze
            const modal = document.getElementById('bookDetailsModal');
            if (modal) {
                modal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
            
            // Then update the book status
            await this.toggleBookStatus(bookId, currentStatus);
        } catch (error) {
            console.error('Error in toggleBookStatusAndCloseModal:', error);
            // Show error toast if something goes wrong
            this.showToast('Error updating book status', 'error');
        }
    }

    async deleteBook(bookId) {
        if (!confirm('Are you sure you want to delete this book?')) return;

        try {
            // Remove from local array
            this.books = this.books.filter(book => book.id !== bookId);
            
            // Remote delete if available
            if (this.supabase) {
                const { error } = await this.supabase
                    .from('books')
                    .delete()
                    .eq('id', bookId);
                if (error) throw error;
            }
            // No localStorage persistence
            
            // Update UI
            this.renderBooks();
            this.updateCounts();
            this.showToast('Book deleted successfully!');
        } catch (error) {
            console.error('Error deleting book:', error);
            this.showToast('Error deleting book', 'error');
        }
    }

    async deleteBookAndCloseModal(bookId) {
        try {
            // Close modal first to prevent UI freeze
            const modal = document.getElementById('bookDetailsModal');
            if (modal) {
                modal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
            
            // Then delete the book
            await this.deleteBook(bookId);
        } catch (error) {
            console.error('Error in deleteBookAndCloseModal:', error);
            // Show error toast if something goes wrong
            this.showToast('Error deleting book', 'error');
        }
    }

    filterBooks() {
        return this.books.filter(book => {
            // Status filter
            if (this.currentFilters.status !== 'all' && book.status !== this.currentFilters.status) {
                return false;
            }

            // Genre filter
            if (this.currentFilters.genre !== 'all' && book.genre !== this.currentFilters.genre) {
                return false;
            }

            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                const matchesTitle = book.title.toLowerCase().includes(searchTerm);
                const matchesAuthor = book.author.toLowerCase().includes(searchTerm);
                if (!matchesTitle && !matchesAuthor) {
                    return false;
                }
            }

            return true;
        });
    }

    renderBooks() {
        const filteredBooks = this.filterBooks();
        const toReadBooks = filteredBooks.filter(book => book.status === 'to-read');
        const ongoingBooks = filteredBooks.filter(book => book.status === 'ongoing');
        const readBooks = filteredBooks.filter(book => book.status === 'read');

        this.renderBookGrid('toReadGrid', toReadBooks);
        this.renderBookGrid('ongoingGrid', ongoingBooks);
        this.renderBookGrid('readGrid', readBooks);
    }

    renderBookGrid(gridId, books) {
        const grid = document.getElementById(gridId);
        grid.innerHTML = '';

        if (books.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-mist-400 mb-4">
                        <i class="fas fa-book-open text-4xl"></i>
                    </div>
                    <p class="text-mist-600">No books found</p>
                </div>
            `;
            return;
        }

        books.forEach(book => {
            const bookCard = this.createBookCard(book);
            grid.appendChild(bookCard);
        });
    }

    createBookCard(book) {
        const card = document.createElement('div');
        card.className = 'book-card animate-fade-in';
        card.innerHTML = `
            <div class="relative group">
                <div class="aspect-[2/3] rounded-2xl overflow-hidden mb-4 shadow-soft cursor-pointer" onclick="libra.showBookDetails(${book.id})">
                    <img 
                        src="${book.cover}" 
                        alt="${book.title}" 
                        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onerror="this.src='https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop'"
                    >
                </div>
                
                <div class="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                        onclick="event.stopPropagation(); libra.toggleBookStatus(${book.id}, '${book.status}')"
                        class="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-soft hover:shadow-gentle transition-all duration-300"
                        title="${book.status === 'to-read' ? 'Start reading' : book.status === 'ongoing' ? 'Mark as read' : 'Mark as to-read'}"
                    >
                        <i class="fas ${book.status === 'to-read' ? 'fa-play' : book.status === 'ongoing' ? 'fa-check' : 'fa-bookmark'} text-sage-600 text-sm"></i>
                    </button>
                    <button 
                        onclick="event.stopPropagation(); libra.deleteBook(${book.id})"
                        class="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-soft hover:shadow-gentle transition-all duration-300"
                        title="Delete book"
                    >
                        <i class="fas fa-trash text-red-500 text-sm"></i>
                    </button>
                </div>
            </div>
            
            <div class="space-y-2 cursor-pointer" onclick="libra.showBookDetails(${book.id})">
                <h3 class="font-semibold text-mist-800 text-balance line-clamp-2 text-sm sm:text-base">${book.title}</h3>
                <p class="text-mist-600 text-xs sm:text-sm">${book.author}</p>
                <div class="flex items-center justify-between">
                    <span class="status-badge ${book.status === 'to-read' ? 'status-to-read' : book.status === 'ongoing' ? 'status-ongoing' : 'status-read'} text-xs">
                        ${book.status === 'to-read' ? 'To Read' : book.status === 'ongoing' ? 'Ongoing' : 'Read'}
                    </span>
                    <span class="text-xs text-mist-400">${book.genre}</span>
                </div>
            </div>
        `;
        return card;
    }

    updateCounts() {
        const toReadCount = this.books.filter(book => book.status === 'to-read').length;
        const ongoingCount = this.books.filter(book => book.status === 'ongoing').length;
        const readCount = this.books.filter(book => book.status === 'read').length;

        document.getElementById('toReadCount').textContent = toReadCount;
        document.getElementById('ongoingCount').textContent = ongoingCount;
        document.getElementById('readCount').textContent = readCount;
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('successToast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (!toast || !toastMessage) {
            console.warn('Toast elements not found');
            return;
        }
        
        toastMessage.textContent = message;
        
        // Reset classes and show toast
        toast.classList.remove('hidden');
        
        if (type === 'error') {
            toast.className = 'fixed bottom-6 right-6 bg-red-500 text-white px-6 py-4 rounded-2xl shadow-gentle transform translate-y-full transition-transform duration-300 z-50';
        } else {
            toast.className = 'fixed bottom-6 right-6 bg-sage-500 text-white px-6 py-4 rounded-2xl shadow-gentle transform translate-y-full transition-transform duration-300 z-50';
        }

        // Show toast
        setTimeout(() => {
            toast.style.transform = 'translateY(0)';
        }, 100);

        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateY(100%)';
            // Hide completely after animation
            setTimeout(() => {
                toast.classList.add('hidden');
                toast.style.transform = 'translateY(100%)';
            }, 300);
        }, 3000);
    }

    showBookDetails(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (!book) return;

        const modal = document.getElementById('bookDetailsModal');
        const content = document.getElementById('bookDetailsContent');

        content.innerHTML = `
            <div class="space-y-6">
                <!-- Book Cover -->
                <div class="flex justify-center">
                    <div class="w-32 sm:w-40 aspect-[2/3] rounded-2xl overflow-hidden shadow-soft">
                        <img 
                            src="${book.cover}" 
                            alt="${book.title}" 
                            class="w-full h-full object-cover"
                            onerror="this.src='https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop'"
                        >
                    </div>
                </div>
                
                <!-- Book Info -->
                <div class="space-y-4">
                    <div class="text-center">
                        <h2 class="text-xl sm:text-2xl font-bold text-mist-800 mb-2 leading-tight">${book.title}</h2>
                        <p class="text-base sm:text-lg text-mist-600">by ${book.author}</p>
                    </div>
                    
                    <!-- Status and Genre -->
                    <div class="flex flex-wrap items-center justify-center gap-3">
                        <span class="status-badge ${book.status === 'to-read' ? 'status-to-read' : book.status === 'ongoing' ? 'status-ongoing' : 'status-read'}">
                            ${book.status === 'to-read' ? 'To Read' : book.status === 'ongoing' ? 'Ongoing Read' : 'Already Read'}
                        </span>
                        <span class="text-sm text-mist-500 bg-cream-100 px-3 py-1 rounded-full">${book.genre}</span>
                        <span class="text-xs sm:text-sm text-mist-400">Added: ${book.addedDate}</span>
                    </div>
                    
                    <!-- Description -->
                    <div class="pt-2">
                        <h3 class="text-base sm:text-lg font-semibold text-mist-800 mb-3">Description</h3>
                        <p class="text-sm sm:text-base text-mist-700 leading-relaxed text-justify">${book.description || 'No description available.'}</p>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex flex-col sm:flex-row gap-3 pt-4">
                        <button 
                            onclick="libra.toggleBookStatusAndCloseModal(${book.id}, '${book.status}')"
                            class="btn-primary flex items-center justify-center space-x-2 text-sm sm:text-base"
                            type="button"
                        >
                            <i class="fas ${book.status === 'to-read' ? 'fa-play' : book.status === 'ongoing' ? 'fa-check' : 'fa-bookmark'}"></i>
                            <span>${book.status === 'to-read' ? 'Start Reading' : book.status === 'ongoing' ? 'Mark as Read' : 'Mark as To Read'}</span>
                        </button>
                        <button 
                            onclick="libra.deleteBookAndCloseModal(${book.id})"
                            class="btn-secondary flex items-center justify-center space-x-2 text-sm sm:text-base"
                        >
                            <i class="fas fa-trash"></i>
                            <span>Delete Book</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Handle image file upload
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.showToast('Please select a valid image file', 'error');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.showToast('Image file size should be less than 5MB', 'error');
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewImg = document.getElementById('previewImg');
                const imagePreview = document.getElementById('imagePreview');
                
                previewImg.src = e.target.result;
                imagePreview.classList.remove('hidden');
                
                // Clear URL input when file is selected
                document.getElementById('bookCover').value = '';
            };
            reader.readAsDataURL(file);
        }
    }

    // Remove image preview
    removeImagePreview() {
        const imagePreview = document.getElementById('imagePreview');
        const fileInput = document.getElementById('bookCoverFile');
        
        imagePreview.classList.add('hidden');
        fileInput.value = '';
        document.getElementById('previewImg').src = ''; // Clear image src
    }

    // Get cover source (either from file or URL)
    getCoverSource() {
        const fileInput = document.getElementById('bookCoverFile');
        const urlInput = document.getElementById('bookCover');
        
        if (fileInput.files.length > 0) {
            // Return the file object
            return fileInput.files[0];
        } else if (urlInput.value.trim()) {
            // Return the URL
            return urlInput.value.trim();
        }
        
        return null;
    }


}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.libra = new LibraLibrary();
});
