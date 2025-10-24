class LocationsDirectory {
    constructor() {
        this.currentExpandedCard = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupAccessibility();
    }

    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('city-search');
        searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));

        // View details buttons
        document.addEventListener('click', this.handleCardInteraction.bind(this));

        // Keyboard navigation for cards
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
    }

    setupAccessibility() {
        // Ensure all interactive elements are focusable
        const cards = document.querySelectorAll('.location-card');
        cards.forEach(card => {
            card.setAttribute('tabindex', '0');
        });
    }

    handleSearch(event) {
        const searchTerm = event.target.value.trim();
        this.fetchLocations(searchTerm);
    }

    async fetchLocations(searchTerm = '') {
        try {
            const response = await fetch(`search.php?search=${encodeURIComponent(searchTerm)}`);
            const data = await response.json();

            if (data.success) {
                this.updateLocationsGrid(data.locations);
            } else {
                console.error('Error fetching locations:', data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            this.showError('Failed to fetch locations. Please try again.');
        }
    }

    updateLocationsGrid(locations) {
        const grid = document.getElementById('locations-grid');
        
        if (locations.length === 0) {
            grid.innerHTML = '<p class="no-results">No locations found. Try a different search term.</p>';
            return;
        }

        grid.innerHTML = locations.map(location => `
            <article class="location-card" data-id="${location.id}" tabindex="0">
                <div class="card-content">
                    <h3 class="city-name">${location.city}</h3>
                    <p class="location-description">${location.description}</p>
                    <p class="location-phone">📞 ${location.phone}</p>
                    <button class="view-details-btn" 
                            aria-expanded="false" 
                            aria-controls="details-${location.id}">
                        View Details
                    </button>
                    <div class="location-details" 
                         id="details-${location.id}" 
                         hidden>
                        <p class="location-address">📍 ${location.address}</p>
                        <p class="location-hours">🕒 ${location.hours}</p>
                    </div>
                </div>
            </article>
        `).join('');

        // Re-bind events for new cards
        this.setupAccessibility();
    }

    handleCardInteraction(event) {
        const viewDetailsBtn = event.target.closest('.view-details-btn');
        if (viewDetailsBtn) {
            event.preventDefault();
            this.toggleCardDetails(viewDetailsBtn);
            return;
        }

        // Close expanded card when clicking outside
        if (this.currentExpandedCard && !event.target.closest('.location-card')) {
            this.collapseCard(this.currentExpandedCard);
        }
    }

    toggleCardDetails(button) {
        const card = button.closest('.location-card');
        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        // Collapse currently expanded card
        if (this.currentExpandedCard && this.currentExpandedCard !== card) {
            this.collapseCard(this.currentExpandedCard);
        }

        if (isExpanded) {
            this.collapseCard(card);
        } else {
            this.expandCard(card);
        }
    }

    expandCard(card) {
        const button = card.querySelector('.view-details-btn');
        const details = card.querySelector('.location-details');

        button.setAttribute('aria-expanded', 'true');
        details.hidden = false;
        
        // Smooth height transition
        details.style.display = 'block';
        const height = details.scrollHeight;
        details.style.height = '0';
        details.style.overflow = 'hidden';
        
        requestAnimationFrame(() => {
            details.style.transition = 'height 0.3s ease';
            details.style.height = height + 'px';
        });

        this.currentExpandedCard = card;
        this.toggleStickyFooter(true);
    }

    collapseCard(card) {
        const button = card.querySelector('.view-details-btn');
        const details = card.querySelector('.location-details');

        button.setAttribute('aria-expanded', 'false');
        
        // Smooth height transition
        details.style.height = details.scrollHeight + 'px';
        details.style.overflow = 'hidden';
        
        requestAnimationFrame(() => {
            details.style.height = '0';
        });

        // Hide details after transition
        setTimeout(() => {
            details.hidden = true;
            details.style.display = '';
            details.style.height = '';
            details.style.overflow = '';
        }, 300);

        if (this.currentExpandedCard === card) {
            this.currentExpandedCard = null;
            this.toggleStickyFooter(false);
        }
    }

    toggleStickyFooter(show) {
        const footer = document.getElementById('sticky-footer');
        const isMobile = window.innerWidth <= 768;

        if (show && isMobile) {
            footer.hidden = false;
        } else {
            footer.hidden = true;
        }
    }

    handleKeyboardNavigation(event) {
        const card = event.target.closest('.location-card');
        if (!card) return;

        switch (event.key) {
            case 'Enter':
            case ' ':
                event.preventDefault();
                const button = card.querySelector('.view-details-btn');
                if (button) this.toggleCardDetails(button);
                break;
            case 'Escape':
                if (this.currentExpandedCard) {
                    this.collapseCard(this.currentExpandedCard);
                }
                break;
        }
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

    showError(message) {
        // Simple error display - you could enhance this with a proper notification system
        console.error(message);
        const grid = document.getElementById('locations-grid');
        grid.innerHTML = `<p class="error-message">${message}</p>`;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LocationsDirectory();
});

// Handle window resize for sticky footer
let directory;
document.addEventListener('DOMContentLoaded', () => {
    directory = new LocationsDirectory();
});

window.addEventListener('resize', () => {
    if (directory) {
        directory.toggleStickyFooter(!!directory.currentExpandedCard);
    }
});
window.addEventListener('resize', () => {
    if (directory) {
        const isMobile = window.innerWidth <= 768;
        if (!isMobile) {
            document.getElementById('sticky-footer').hidden = true;
        }
    }
});

