const venues = [
    {
        id: 1,
        title: "Neon Smash Badminton",
        sport: "Badminton",
        type: "indoor",
        location: "Downtown Complex",
        price: 25,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 2,
        title: "Apex Arena Football",
        sport: "Football",
        type: "outdoor",
        location: "Northside Park",
        price: 80,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1575361204481-48a2b5a5b565?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 3,
        title: "Pro serve Tennis Club",
        sport: "Tennis",
        type: "outdoor",
        location: "West End View",
        price: 35,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 4,
        title: "Skyline Turf",
        sport: "Football",
        type: "indoor",
        location: "Metro Mall Rooftop",
        price: 100,
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 5,
        title: "Elite Shuttle Center",
        sport: "Badminton",
        type: "indoor",
        location: "East Side Recreation",
        price: 20,
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1613918431703-936b801a24d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 6,
        title: "Grand Slam Courts",
        sport: "Tennis",
        type: "indoor",
        location: "City Heart Ave",
        price: 45,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
];

const venuesGrid = document.getElementById('venuesGrid');
const filterBtns = document.querySelectorAll('.filter-btn');

function renderVenues(filter = 'all') {
    venuesGrid.innerHTML = '';
    
    const filtered = filter === 'all' 
        ? venues 
        : venues.filter(v => v.type === filter || v.sport.toLowerCase() === filter);
        
    filtered.forEach((venue, index) => {
        const card = document.createElement('div');
        card.className = 'venue-card animate';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="venue-image-wrapper">
                <img src="${venue.image}" alt="${venue.title}" class="venue-image">
                <span class="venue-tag ${venue.type}">${venue.type.toUpperCase()}</span>
            </div>
            <div class="venue-content">
                <div class="venue-header">
                    <h3 class="venue-title">${venue.title}</h3>
                    <div class="venue-rating">★ ${venue.rating}</div>
                </div>
                <div class="venue-location">📍 ${venue.location} • ${venue.sport}</div>
                <div class="venue-footer">
                    <div class="venue-price">$${venue.price}<span>/hr</span></div>
                    <button class="btn-book">Book Now</button>
                </div>
            </div>
        `;
        venuesGrid.appendChild(card);
    });
}

// Initial render
renderVenues();

// Handling filter button clicks
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Remove active class from all buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        e.target.classList.add('active');
        
        // Render venues based on the selected filter
        renderVenues(e.target.dataset.filter);
    });
});
