<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Locations Directory</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Header with logo and navigation menu -->
    <header class="header">
        <div class="header-content">
            <div class="logo"><img src="location.png" style="height: 55px; width: auto;"></div>
            <nav class="nav">
                <a href="#home" class="nav-link">Home</a>
                <a href="#about" class="nav-link">About</a>
                <a href="#contact" class="nav-link">Contact</a>
            </nav>
        </div>
    </header>

    <!-- Hero banner with intro text and call-to-action button -->
    <section class="hero" id="home">
        <div class="hero-content">
            <h1 class="hero-title">Find Our Locations</h1>
            <p class="hero-subtext">Discover our offices across the country and visit us today!</p>
            <button class="cta-button" onclick="document.getElementById('city-search').focus()">Get Started</button>
        </div>
    </section>

    <!-- Main content section -->
    <main class="main-content">
        <!-- Sidebar containing search/filter options -->
        <aside class="sidebar">
            <div class="filter-container">
                <h2 class="filter-title">Find a Location</h2>
                <div class="search-box">
                    <label for="city-search" class="search-label">Search by city</label>
                    <input 
                        type="text" 
                        id="city-search" 
                        class="search-input" 
                        placeholder="Enter city name..."
                        aria-label="Search locations by city"
                    >
                </div>
            </div>
        </aside>

        <!-- Section where location cards will be displayed -->
        <section class="locations-section">
            <div class="locations-grid" id="locations-grid">
                <!-- Location cards will be inserted here dynamically -->
            </div>
        </section>
    </main>

    <!-- Sticky footer visible only on mobile devices -->
    <footer class="sticky-footer" id="sticky-footer" hidden>
        <button class="contact-btn">Contact This Location</button>
    </footer>

    <!-- JavaScript for handling search and dynamic content -->
    <script>
    // Grab references to search input and grid container
    const searchInput = document.getElementById('city-search');
    const locationsGrid = document.getElementById('locations-grid');

    // Fetch locations from PHP backend based on search input
    async function fetchLocations(search = '') {
        try {
            const res = await fetch(`search.php?search=${encodeURIComponent(search)}`);
            const data = await res.json();

            // Clear previous results before showing new ones
            locationsGrid.innerHTML = '';

            if (data.success && data.count > 0) {
                // Loop through locations and create cards for each
                data.locations.forEach(loc => {
                    const card = document.createElement('article');
                    card.classList.add('location-card');
                    card.setAttribute('data-id', loc.id);

                    card.innerHTML = `
                        <div class="card-content">
                            <h3 class="city-name">${loc.city}</h3>
                            <p class="location-description">${loc.description}</p>
                            <p class="location-phone">📞 ${loc.phone}</p>
                            <button class="view-details-btn" aria-expanded="false">
                                View Details
                            </button>
                            <div class="location-details" hidden>
                                <p class="location-address">📍 ${loc.address}</p>
                                <p class="location-hours">🕒 ${loc.hours}</p>
                            </div>
                        </div>
                    `;

                    // Handle show/hide details button
                    card.querySelector('.view-details-btn').addEventListener('click', (e) => {
                        const btn = e.target;
                        const details = btn.nextElementSibling;
                        const expanded = btn.getAttribute('aria-expanded') === 'true';
                        btn.setAttribute('aria-expanded', !expanded);
                        details.hidden = expanded;
                    });

                    // Add card to grid
                    locationsGrid.appendChild(card);
                });
            } else {
                // If no results found, show message
                locationsGrid.innerHTML = `<p>No locations found.</p>`;
            }

        } catch (error) {
            // Handle fetch or server errors
            console.error('Error fetching locations:', error);
            locationsGrid.innerHTML = `<p style="color:red;">Error loading locations.</p>`;
        }
    }

    // Listen for typing in search input to trigger live filtering
    searchInput.addEventListener('input', (e) => {
        fetchLocations(e.target.value);
    });

    // Load all locations when page first opens
    fetchLocations();
    </script>
</body>
</html>
