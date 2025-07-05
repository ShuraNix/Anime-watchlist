// API Service Class
class AnimeApiService {
    constructor() {
        this.jikanBaseUrl = 'https://api.jikan.moe/v4';
        this.localBaseUrl = 'http://localhost:8000/api/anime';
    }

    async searchAnime(query) {
        try {
            const response = await fetch(`${this.jikanBaseUrl}/anime?q=${encodeURIComponent(query)}&limit=12`);
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Search error:', error);
            throw new Error('Failed to search anime');
        }
    }

    async getAnimeDetails(malId) {
        try {
            const response = await fetch(`${this.jikanBaseUrl}/anime/${malId}`);
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Fetch details error:', error);
            throw new Error('Failed to get anime details');
        }
    }

    async getWatchlist() {
        try {
            const response = await fetch(this.localBaseUrl);
            return await response.json();
        } catch (error) {
            console.error('Load watchlist error:', error);
            throw new Error('Failed to load watchlist');
        }
    }

    async addToWatchlist(animeData) {
        try {
            const response = await fetch(this.localBaseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(animeData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to add anime');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Add to watchlist error:', error);
            throw error;
        }
    }

    async updateAnime(id, updateData) {
        try {
            const response = await fetch(`${this.localBaseUrl}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to update anime');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Update error:', error);
            throw error;
        }
    }

    async deleteAnime(id) {
        try {
            const response = await fetch(`${this.localBaseUrl}/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete anime');
            }
            
            return true;
        } catch (error) {
            console.error('Delete error:', error);
            throw error;
        }
    }
}

// UI Service Class
class UIService {
    constructor() {
        this.domElements = {
            search: document.getElementById('search'),
            searchBtn: document.getElementById('searchBtn'),
            results: document.getElementById('results'),
            watchlist: document.getElementById('watchlist'),
            modal: document.getElementById('anime-modal'),
            modalContent: document.querySelector('.modal-content'),
            modalBody: document.querySelector('.modal-body'),
            closeModal: document.querySelector('.close-modal'),
            tabBtns: document.querySelectorAll('.tab-btn'),
            backToMainBtn: document.getElementById('back-to-main-btn'),
            backBtn: document.getElementById('back-btn'),
            themeToggle: document.getElementById('theme-toggle'),
            confirmModal: document.getElementById('confirm-modal'),
            confirmMessage: document.getElementById('confirm-message'),
            confirmCancel: document.getElementById('confirm-cancel'),
            confirmOk: document.getElementById('confirm-ok')
        };

        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.applyTheme();
    }

    applyTheme() {
        document.body.className = `${this.currentTheme}-theme`;
        localStorage.setItem('theme', this.currentTheme);
        
        // Update theme toggle icon
        const icon = this.domElements.themeToggle.querySelector('i');
        icon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
    }

    showLoading(element) {
        element.innerHTML = '<div class="loading-spinner"></div>';
    }

    showError(message, element) {
        element.innerHTML = `<div class="error-message">${message}</div>`;
    }

    showModal(content) {
        this.domElements.modalBody.innerHTML = content;
        this.domElements.modal.style.display = 'flex';
    }

    closeModal() {
        this.domElements.modal.style.display = 'none';
        this.domElements.confirmModal.style.display = 'none';
    }

    showConfirm(message) {
        return new Promise((resolve) => {
            this.domElements.confirmMessage.textContent = message;
            this.domElements.confirmModal.style.display = 'flex';
            
            this.domElements.confirmCancel.onclick = () => {
                this.closeModal();
                resolve(false);
            };
            
            this.domElements.confirmOk.onclick = () => {
                this.closeModal();
                resolve(true);
            };
        });
    }

    renderSearchResults(animeList) {
        if (!animeList.length) {
            this.domElements.results.innerHTML = '<p>No results found. Try a different search term.</p>';
            return;
        }

        this.domElements.results.innerHTML = animeList.map(anime => `
            <div class="anime-card">
                <img src="${anime.images?.jpg?.image_url || anime.image_url}" alt="${anime.title}" loading="lazy">
                <div class="anime-info">
                    <h3>${anime.title}</h3>
                    <div class="anime-actions">
                        <button class="btn btn-primary add-btn" data-action="add" data-status="watching" data-mal_id="${anime.mal_id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn add-btn" data-action="add" data-status="planned" data-mal_id="${anime.mal_id}">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="btn" data-action="details" data-mal_id="${anime.mal_id}">
                            <i class="fas fa-info-circle"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderWatchlist(animeList, currentTab) {
        if (!animeList.length) {
            this.domElements.watchlist.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tv"></i>
                    <p>Your ${currentTab} list is empty</p>
                </div>
            `;
            return;
        }

        this.domElements.watchlist.innerHTML = animeList.map(anime => `
            <div class="anime-card">
                <img src="${anime.image_url}" alt="${anime.title}" loading="lazy">
                <div class="anime-info">
                    <h3>${anime.title}</h3>
                    <div class="anime-actions">
                        <select class="status-select" data-id="${anime._id}">
                            <option value="watching" ${anime.status === 'watching' ? 'selected' : ''}>Watching</option>
                            <option value="planned" ${anime.status === 'planned' ? 'selected' : ''}>Planned</option>
                            <option value="completed" ${anime.status === 'completed' ? 'selected' : ''}>Completed</option>
                        </select>
                        <button class="btn btn-danger" data-action="delete" data-id="${anime._id}">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn" data-action="details" data-mal_id="${anime.mal_id}">
                            <i class="fas fa-info-circle"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderAnimeDetails(anime) {
        return `
            <div class="anime-details">
                <div class="anime-header">
                    <img src="${anime.images?.jpg?.image_url || anime.image_url}" alt="${anime.title}">
                    <div class="anime-meta">
                        <h2>${anime.title}</h2>
                        <p>${anime.type} • ${anime.episodes || '?'} eps • ${anime.status}</p>
                        <div class="anime-synopsis">
                            <h4>Synopsis</h4>
                            <p>${anime.synopsis || 'No synopsis available.'}</p>
                        </div>
                    </div>
                </div>
                <div class="anime-stats">
                    <div class="stat">
                        <span class="stat-label">Score</span>
                        <span class="stat-value">${anime.score || 'N/A'}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Rank</span>
                        <span class="stat-value">${anime.rank || 'N/A'}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Popularity</span>
                        <span class="stat-value">#${anime.popularity || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `;
    }
}

// App Controller Class
class AnimeTrackerApp {
    constructor() {
        this.apiService = new AnimeApiService();
        this.uiService = new UIService();
        this.state = {
            currentTab: 'watching',
            searchResults: [],
            watchlist: {
                watching: [],
                planned: [],
                completed: []
            }
        };

        this.initEventListeners();
        this.loadWatchlist();
    }

    initEventListeners() {
        // Search
        this.uiService.domElements.searchBtn.addEventListener('click', () => this.handleSearch());
        this.uiService.domElements.search.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        // Modal
        this.uiService.domElements.closeModal.addEventListener('click', () => this.uiService.closeModal());
        this.uiService.domElements.backBtn.addEventListener('click', () => this.uiService.closeModal());
        window.addEventListener('click', (e) => {
            if (e.target === this.uiService.domElements.modal) this.uiService.closeModal();
        });

        // Tabs
        this.uiService.domElements.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.state.currentTab = btn.dataset.status;
                this.uiService.domElements.tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderWatchlist();
            });
        });

        // Back to main button
        this.uiService.domElements.backToMainBtn.addEventListener('click', () => {
            this.state.searchResults = [];
            this.uiService.domElements.results.innerHTML = '';
            this.uiService.domElements.backToMainBtn.style.display = 'none';
        });

        // Theme toggle
        this.uiService.domElements.themeToggle.addEventListener('click', () => {
            this.uiService.toggleTheme();
        });

        // Event delegation for dynamic elements
        this.uiService.domElements.results.addEventListener('click', (e) => this.handleResultsClick(e));
        this.uiService.domElements.watchlist.addEventListener('click', (e) => this.handleWatchlistClick(e));
        this.uiService.domElements.watchlist.addEventListener('change', (e) => this.handleStatusChange(e));
    }

    async handleSearch() {
        const query = this.uiService.domElements.search.value.trim();
        if (!query) return;

        try {
            this.uiService.showLoading(this.uiService.domElements.results);
            this.state.searchResults = await this.apiService.searchAnime(query);
            this.uiService.renderSearchResults(this.state.searchResults);
            this.uiService.domElements.backToMainBtn.style.display = 'inline-block';
        } catch (error) {
            this.uiService.showError(error.message, this.uiService.domElements.results);
        }
    }

    async loadWatchlist() {
        try {
            const watchlist = await this.apiService.getWatchlist();
            
            // Organize by status
            this.state.watchlist = {
                watching: watchlist.filter(a => a.status === 'watching'),
                planned: watchlist.filter(a => a.status === 'planned'),
                completed: watchlist.filter(a => a.status === 'completed')
            };
            
            this.renderWatchlist();
        } catch (error) {
            console.error('Error loading watchlist:', error);
        }
    }

    renderWatchlist() {
        const currentList = this.state.watchlist[this.state.currentTab];
        this.uiService.renderWatchlist(currentList, this.state.currentTab);
    }

    async showAnimeDetails(malId) {
        try {
            const anime = await this.apiService.getAnimeDetails(malId);
            const detailsHtml = this.uiService.renderAnimeDetails(anime);
            this.uiService.showModal(detailsHtml);
        } catch (error) {
            console.error('Error showing details:', error);
            alert('Failed to load anime details');
        }
    }

    async addAnimeToWatchlist(malId, status) {
        const anime = this.state.searchResults.find(a => a.mal_id === malId);
        if (!anime) return;

        try {
            await this.apiService.addToWatchlist({
                mal_id: anime.mal_id,
                title: anime.title,
                image_url: anime.images?.jpg?.image_url || anime.image_url,
                status
            });
            
            await this.loadWatchlist();
            alert('Anime added to your watchlist!');
        } catch (error) {
            alert(error.message);
        }
    }

    async updateAnimeStatus(id, newStatus) {
        try {
            await this.apiService.updateAnime(id, { status: newStatus });
            await this.loadWatchlist();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }

    async deleteAnimeFromWatchlist(id) {
        const confirmed = await this.uiService.showConfirm('Are you sure you want to remove this anime from your watchlist?');
        if (!confirmed) return;

        try {
            await this.apiService.deleteAnime(id);
            await this.loadWatchlist();
        } catch (error) {
            console.error('Error deleting anime:', error);
            alert('Failed to delete anime');
        }
    }

    handleResultsClick(e) {
        const button = e.target.closest('button');
        if (!button) return;

        const action = button.dataset.action;
        const malId = parseInt(button.dataset.mal_id);

        if (action === 'details') {
            this.showAnimeDetails(malId);
        } else if (action === 'add') {
            const status = button.dataset.status;
            this.addAnimeToWatchlist(malId, status);
        }
    }

    handleWatchlistClick(e) {
        const button = e.target.closest('button');
        if (!button) return;

        const action = button.dataset.action;
        const id = button.dataset.id;
        const malId = parseInt(button.dataset.mal_id);

        if (action === 'details') {
            this.showAnimeDetails(malId);
        } else if (action === 'delete') {
            this.deleteAnimeFromWatchlist(id);
        }
    }

    handleStatusChange(e) {
        if (e.target.classList.contains('status-select')) {
            const id = e.target.dataset.id;
            const newStatus = e.target.value;
            this.updateAnimeStatus(id, newStatus);
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new AnimeTrackerApp();
});