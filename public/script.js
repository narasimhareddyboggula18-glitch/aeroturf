/* ============================================
   AeroTurf — Main Application Script
   ============================================ */

const API = '';

// ==================== STATE ====================
let allVenues = [];
let currentFilter = 'all';
let currentUser = JSON.parse(localStorage.getItem('aeroturf_user')) || null;
let bookingState = { venue: null, date: null, slot: null, numPlayers: 1 };
let testimonialIndex = 0;
let allMyBookings = []; // for history filtering

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initParticles();
    initScrollEffects();
    initNavbar();
    initTypewriter();
    initSportCards();
    initAuth();
    initSearch();
    fetchVenues();
    initTestimonials();
    initStatsCounter();
    updateAuthUI();
    initPlayersSelector();

    // CTA button
    document.getElementById('ctaBtn')?.addEventListener('click', () => {
        if (!currentUser) openModal('authModal');
        else document.getElementById('venues').scrollIntoView({ behavior: 'smooth' });
    });

    // Footer sport links
    document.querySelectorAll('[data-sport-link]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sport = link.dataset.sportLink;
            filterVenues(sport);
            document.getElementById('venues').scrollIntoView({ behavior: 'smooth' });
        });
    });
});

// ==================== LOADER ====================
function initLoader() {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 1200);
}

// ==================== PARTICLE SYSTEM ====================
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.color = Math.random() > 0.5 ? '99, 102, 241' : '16, 185, 129';
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
            ctx.fill();
        }
    }

    const count = Math.min(80, Math.floor(canvas.width * canvas.height / 15000));
    for (let i = 0; i < count; i++) particles.push(new Particle());

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.08 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        connectParticles();
        requestAnimationFrame(animate);
    }
    animate();
}

// ==================== SCROLL EFFECTS ====================
function initScrollEffects() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ==================== NAVBAR ====================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    });

    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
        document.body.classList.toggle('menu-open');
    });

    // Close mobile menu on backdrop click
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('open') &&
            !navLinks.contains(e.target) &&
            !hamburger.contains(e.target)) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.classList.remove('menu-open');
        }
    });

    navLinks?.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.classList.remove('menu-open');
        });
    });

    // Active nav on scroll
    const sections = document.querySelectorAll('section[id], header[id]');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 100) current = section.getAttribute('id');
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    });
}

// ==================== TYPEWRITER ====================
function initTypewriter() {
    const el = document.getElementById('typewriterText');
    if (!el) return;
    const phrases = [
        'Book Premium Venues.',
        'Play Cricket Like a Pro.',
        'Dominate the Football Turf.',
        'Master the Kabaddi Mat.',
        'Crush It at the Gym.',
        'Ace the Tennis Court.',
        'Smash at the Badminton Court.'
    ];
    let phraseIdx = 0, charIdx = 0, deleting = false;
    function type() {
        const phrase = phrases[phraseIdx];
        if (!deleting) {
            el.textContent = phrase.substring(0, charIdx + 1);
            charIdx++;
            if (charIdx === phrase.length) { deleting = true; setTimeout(type, 2000); return; }
            setTimeout(type, 60);
        } else {
            el.textContent = phrase.substring(0, charIdx - 1);
            charIdx--;
            if (charIdx === 0) { deleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; setTimeout(type, 300); return; }
            setTimeout(type, 30);
        }
    }
    setTimeout(type, 800);
}

// ==================== SPORT CARDS ====================
function initSportCards() {
    document.querySelectorAll('.sport-card').forEach(card => {
        card.addEventListener('click', () => {
            filterVenues(card.dataset.sport);
            document.getElementById('venues').scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// ==================== FETCH VENUES ====================
async function fetchVenues() {
    try {
        const res = await fetch(`${API}/api/venues`);
        const json = await res.json();
        if (json.success) {
            allVenues = json.data;
            renderVenues(allVenues);
        }
    } catch (err) {
        console.error('Failed to fetch venues:', err);
        showToast('error', 'Failed to load venues. Please refresh.');
    }
}

// ==================== FILTER VENUES ====================
function filterVenues(sport) {
    currentFilter = sport;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.filter === sport));
    document.querySelectorAll('.sport-card').forEach(card => {
        card.classList.toggle('active', card.dataset.sport === sport);
        if (sport === 'all') card.classList.remove('active');
    });
    const filtered = sport === 'all' ? allVenues : allVenues.filter(v => v.sport.toLowerCase() === sport.toLowerCase());
    renderVenues(filtered);
}

// ==================== RENDER VENUES ====================
function renderVenues(venues) {
    const grid = document.getElementById('venuesGrid');
    if (!grid) return;
    grid.innerHTML = '';
    if (venues.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:4rem 2rem;color:var(--text-muted);">
            <i class="fas fa-search" style="font-size:2.5rem;margin-bottom:1rem;display:block;"></i>
            <p style="font-size:1.1rem;">No venues found. Try a different filter or search.</p>
        </div>`;
        return;
    }
    const sportIcons = {
        Cricket: 'fa-baseball-ball', Football: 'fa-futbol', Kabaddi: 'fa-hand-fist',
        Gym: 'fa-dumbbell', Tennis: 'fa-table-tennis-paddle-ball', Badminton: 'fa-shuttlecock'
    };
    venues.forEach((venue, index) => {
        const card = document.createElement('div');
        card.className = 'venue-card reveal';
        card.style.setProperty('--delay', `${index * 0.08}s`);
        const amenitiesHTML = (venue.amenities || []).slice(0, 3).map(a => `<span class="venue-amenity">${a}</span>`).join('');
        card.innerHTML = `
            <div class="venue-image-wrapper">
                <img src="${venue.image}" alt="${venue.title}" class="venue-image" loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1461896836934-bbe910bba2c6?w=800&q=80'">
                <div class="venue-badge-row">
                    <span class="venue-sport-tag"><i class="fas ${sportIcons[venue.sport] || 'fa-trophy'}"></i> ${venue.sport}</span>
                    <span class="venue-tag ${venue.type}">${venue.type.toUpperCase()}</span>
                </div>
            </div>
            <div class="venue-content">
                <div class="venue-header">
                    <h3 class="venue-title">${venue.title}</h3>
                    <div class="venue-rating"><i class="fas fa-star"></i> ${venue.rating}</div>
                </div>
                <div class="venue-meta">
                    <span><i class="fas fa-map-marker-alt"></i> ${venue.location}</span>
                    <span><i class="fas fa-city"></i> ${venue.city}</span>
                </div>
                <div class="venue-amenities">${amenitiesHTML}</div>
                <div class="venue-footer">
                    <div class="venue-price">₹${venue.price}<span>/hr</span></div>
                    <button class="btn-book" onclick="openBooking(${venue.id})">
                        <i class="fas fa-bolt"></i> Book Now
                    </button>
                </div>
            </div>`;
        grid.appendChild(card);
    });
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    grid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ==================== FILTER BUTTONS ====================
document.addEventListener('click', (e) => {
    if (e.target.closest('.filter-btn')) {
        const btn = e.target.closest('.filter-btn');
        if (btn.dataset.filter) filterVenues(btn.dataset.filter);
    }
});

// ==================== SEARCH ====================
function initSearch() {
    const input = document.getElementById('searchInput');
    const btn = document.getElementById('searchBtn');
    let timeout;
    function doSearch() {
        const q = input.value.trim().toLowerCase();
        if (!q) { filterVenues('all'); return; }
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.sport-card').forEach(c => c.classList.remove('active'));
        const results = allVenues.filter(v =>
            v.title.toLowerCase().includes(q) || v.sport.toLowerCase().includes(q) ||
            v.location.toLowerCase().includes(q) || v.city.toLowerCase().includes(q) ||
            (v.amenities || []).some(a => a.toLowerCase().includes(q))
        );
        renderVenues(results);
        document.getElementById('venues').scrollIntoView({ behavior: 'smooth' });
    }
    input?.addEventListener('input', () => { clearTimeout(timeout); timeout = setTimeout(doSearch, 400); });
    btn?.addEventListener('click', doSearch);
    input?.addEventListener('keypress', (e) => { if (e.key === 'Enter') doSearch(); });
}

// ==================== BOOKING FLOW ====================
function openBooking(venueId) {
    // ★ GATE: must be logged in to book
    if (!currentUser) {
        openModal('loginGateModal');
        return;
    }

    const venue = allVenues.find(v => v.id === venueId);
    if (!venue) return;

    bookingState = { venue, date: null, slot: null, numPlayers: 1 };

    document.getElementById('bookingVenueImg').src = venue.image;
    document.getElementById('bookingVenueImg').alt = venue.title;
    document.getElementById('bookingVenueSport').textContent = venue.sport;
    document.getElementById('bookingVenueTitle').textContent = venue.title;
    document.getElementById('bookingVenueLocation').querySelector('span').textContent = `${venue.location}, ${venue.city}`;
    document.getElementById('bookingVenuePrice').textContent = `₹${venue.price}`;

    // Pre-fill user info
    document.getElementById('bookingName').value = currentUser.name || '';
    document.getElementById('bookingEmail').value = currentUser.email || '';
    document.getElementById('bookingPhone').value = '';

    // Reset players
    bookingState.numPlayers = 1;
    document.getElementById('playersCount').textContent = '1';
    updatePlayersNote();
    updateBookingTotal();

    generateDates();
    goToBookingStep(1);
    openModal('bookingModal');
}

function generateDates() {
    const grid = document.getElementById('dateGrid');
    grid.innerHTML = '';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const card = document.createElement('div');
        card.className = 'date-card';
        card.dataset.date = dateStr;
        card.innerHTML = `
            <div class="date-day">${days[d.getDay()]}</div>
            <div class="date-num">${d.getDate()}</div>
            <div class="date-month">${months[d.getMonth()]}</div>`;
        card.addEventListener('click', () => selectDate(dateStr, card));
        grid.appendChild(card);
    }
}

function selectDate(dateStr, cardEl) {
    bookingState.date = dateStr;
    bookingState.slot = null;
    document.querySelectorAll('.date-card').forEach(c => c.classList.remove('selected'));
    cardEl.classList.add('selected');
    setTimeout(() => { goToBookingStep(2); loadSlots(dateStr); }, 300);
}

async function loadSlots(dateStr) {
    const grid = document.getElementById('slotsGrid');
    grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;">Loading slots...</p>';
    const label = document.getElementById('selectedDateLabel');
    const d = new Date(dateStr);
    label.textContent = `📅 ${d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`;
    try {
        const res = await fetch(`${API}/api/venues/${bookingState.venue.id}/slots?date=${dateStr}`);
        const json = await res.json();
        grid.innerHTML = '';
        if (json.success && json.data.length > 0) {
            json.data.forEach(slot => {
                const btn = document.createElement('button');
                btn.className = `slot-btn${slot.available ? '' : ' unavailable'}`;
                btn.textContent = slot.time;
                if (slot.available) btn.addEventListener('click', () => selectSlot(slot.time, btn));
                grid.appendChild(btn);
            });
        } else {
            grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;">No slots available for this date.</p>';
        }
    } catch {
        grid.innerHTML = '<p style="color:var(--danger);grid-column:1/-1;text-align:center;">Failed to load slots.</p>';
    }
}

function selectSlot(time, btnEl) {
    bookingState.slot = time;
    document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
    btnEl.classList.add('selected');
    setTimeout(() => { goToBookingStep(3); renderBookingSummary(); updateBookingTotal(); }, 300);
}

function renderBookingSummary() {
    const summary = document.getElementById('bookingSummary');
    const v = bookingState.venue;
    const d = new Date(bookingState.date);
    summary.innerHTML = `
        <div class="booking-summary-row">
            <span class="label">Venue</span><span class="value">${v.title}</span>
        </div>
        <div class="booking-summary-row">
            <span class="label">Sport</span><span class="value">${v.sport}</span>
        </div>
        <div class="booking-summary-row">
            <span class="label">Date</span>
            <span class="value">${d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
        </div>
        <div class="booking-summary-row">
            <span class="label">Time Slot</span><span class="value">${bookingState.slot}</span>
        </div>
        <div class="booking-summary-row">
            <span class="label">Duration</span><span class="value">1 Hour</span>
        </div>
        <div class="booking-summary-row">
            <span class="label">Price/hr</span><span class="value">₹${v.price}</span>
        </div>`;
}

function goToBookingStep(step) {
    document.querySelectorAll('.booking-step').forEach(s => {
        const sNum = parseInt(s.dataset.step);
        s.classList.remove('active', 'completed');
        if (sNum === step) s.classList.add('active');
        if (sNum < step) s.classList.add('completed');
    });
    document.querySelectorAll('.booking-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`bookingStep${step}`).classList.add('active');
}

// ==================== PLAYERS SELECTOR ====================
function initPlayersSelector() {
    document.getElementById('playersDecrement')?.addEventListener('click', () => {
        if (bookingState.numPlayers > 1) {
            bookingState.numPlayers--;
            document.getElementById('playersCount').textContent = bookingState.numPlayers;
            updatePlayersNote();
            updateBookingTotal();
        }
    });
    document.getElementById('playersIncrement')?.addEventListener('click', () => {
        if (bookingState.numPlayers < 20) {
            bookingState.numPlayers++;
            document.getElementById('playersCount').textContent = bookingState.numPlayers;
            updatePlayersNote();
            updateBookingTotal();
        }
    });
}

function updatePlayersNote() {
    const note = document.getElementById('playersNote');
    if (!note) return;
    note.textContent = `${bookingState.numPlayers} player${bookingState.numPlayers > 1 ? 's' : ''}`;
}

function updateBookingTotal() {
    const el = document.getElementById('bookingTotalPrice');
    if (!el || !bookingState.venue) return;
    const total = bookingState.venue.price * bookingState.numPlayers;
    el.textContent = `₹${total}`;
}

// Confirm booking
document.getElementById('confirmBookingBtn')?.addEventListener('click', async () => {
    const name  = document.getElementById('bookingName').value.trim();
    const email = document.getElementById('bookingEmail').value.trim();
    const phone = document.getElementById('bookingPhone').value.trim();

    if (!name || !email) { showToast('error', 'Please enter your name and email.'); return; }

    const btn = document.getElementById('confirmBookingBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';

    try {
        const res = await fetch(`${API}/api/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                venueId:    bookingState.venue.id,
                date:       bookingState.date,
                slot:       bookingState.slot,
                userName:   name,
                userEmail:  email,
                userPhone:  phone,
                numPlayers: bookingState.numPlayers
            })
        });
        const json = await res.json();
        if (json.success) {
            closeModal('bookingModal');
            showToast('success', `🎉 ${json.message} Enjoy your game at ${bookingState.venue.title}!`);
        } else {
            showToast('error', json.message || 'Booking failed. Please try again.');
        }
    } catch {
        showToast('error', 'Network error. Please try again.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check"></i> Confirm Booking';
    }
});

document.getElementById('closeBooking')?.addEventListener('click', () => closeModal('bookingModal'));

// ==================== LOGIN GATE MODAL ====================
document.getElementById('closeLoginGate')?.addEventListener('click', () => closeModal('loginGateModal'));
document.getElementById('loginGateSignIn')?.addEventListener('click', () => {
    closeModal('loginGateModal');
    openAuthModal('login');
});
document.getElementById('loginGateSignUp')?.addEventListener('click', () => {
    closeModal('loginGateModal');
    openAuthModal('register');
});

// ==================== AUTH ====================
function openAuthModal(tab = 'login') {
    // Switch to the right tab
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.auth-tab[data-tab="${tab}"]`)?.classList.add('active');
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.getElementById(tab === 'login' ? 'loginForm' : 'registerForm')?.classList.add('active');
    openModal('authModal');
}

function initAuth() {
    document.getElementById('btnAuth')?.addEventListener('click', () => openAuthModal('login'));
    document.getElementById('closeAuth')?.addEventListener('click', () => closeModal('authModal'));

    // Mobile nav auth buttons
    document.getElementById('btnAuthMobile')?.addEventListener('click', () => {
        document.getElementById('hamburger').classList.remove('active');
        document.getElementById('navLinks').classList.remove('open');
        document.body.classList.remove('menu-open');
        openAuthModal('login');
    });
    document.getElementById('btnMyBookingsMobile')?.addEventListener('click', () => {
        document.getElementById('hamburger').classList.remove('active');
        document.getElementById('navLinks').classList.remove('open');
        document.body.classList.remove('menu-open');
        loadMyBookings();
        openModal('myBookingsModal');
    });
    document.getElementById('btnLogoutMobile')?.addEventListener('click', () => {
        document.getElementById('hamburger').classList.remove('active');
        document.getElementById('navLinks').classList.remove('open');
        document.body.classList.remove('menu-open');
        logout();
    });

    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            document.getElementById(tab.dataset.tab === 'login' ? 'loginForm' : 'registerForm').classList.add('active');
        });
    });

    // Login
    document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email    = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const btn      = document.getElementById('loginSubmitBtn');
        btn.disabled   = true;
        btn.innerHTML  = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
        try {
            const res  = await fetch(`${API}/api/auth/login`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const json = await res.json();
            if (json.success) {
                currentUser = json.data;
                localStorage.setItem('aeroturf_user', JSON.stringify(currentUser));
                updateAuthUI();
                closeModal('authModal');
                showToast('success', `Welcome back, ${currentUser.name}! 🏟️`);
            } else {
                // Friendly messages for common Supabase auth errors
                let msg = json.message || 'Login failed.';
                if (msg.toLowerCase().includes('invalid login') || msg.toLowerCase().includes('invalid credentials')) {
                    msg = 'Incorrect email or password. Please try again.';
                } else if (msg.toLowerCase().includes('email not confirmed')) {
                    msg = 'Your email is not confirmed yet. Please check your inbox and click the verification link, or ask admin to disable email confirmation in Supabase.';
                } else if (msg.toLowerCase().includes('user not found')) {
                    msg = 'No account found with this email. Please sign up first.';
                }
                showToast('error', msg);
            }
        } catch {
            showToast('error', 'Network error. Please check your connection and try again.');
        } finally {
            btn.disabled  = false;
            btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
        }
    });

    // Register
    document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name     = document.getElementById('regName').value.trim();
        const email    = document.getElementById('regEmail').value.trim();
        const phone    = document.getElementById('regPhone').value.trim();
        const password = document.getElementById('regPassword').value;
        const btn      = document.getElementById('registerSubmitBtn');
        btn.disabled   = true;
        btn.innerHTML  = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
        try {
            const res  = await fetch(`${API}/api/auth/register`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, password })
            });
            const json = await res.json();
            if (json.success) {
                // If Supabase returns a user with an ID, log them in immediately.
                // If email confirmation is ON in Supabase, id may be present but
                // login will fail until confirmed — in that case just show guide.
                if (json.data && json.data.id) {
                    currentUser = json.data;
                    localStorage.setItem('aeroturf_user', JSON.stringify(currentUser));
                    updateAuthUI();
                    closeModal('authModal');
                    showToast('success', `Welcome to AeroTurf, ${currentUser.name}! 🎉`);
                } else {
                    // Email confirmation required
                    closeModal('authModal');
                    showToast('info', `Account created! Check your email (${email}) to confirm, then sign in.`);
                }
            } else {
                let msg = json.message || 'Registration failed.';
                if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already been registered')) {
                    msg = 'An account with this email already exists. Please sign in instead.';
                } else if (msg.toLowerCase().includes('password')) {
                    msg = 'Password must be at least 6 characters.';
                }
                showToast('error', msg);
            }
        } catch {
            showToast('error', 'Registration failed. Please try again.');
        } finally {
            btn.disabled  = false;
            btn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
        }
    });

    // Logout
    document.getElementById('btnLogout')?.addEventListener('click', logout);

    // My Bookings (desktop)
    document.getElementById('btnMyBookings')?.addEventListener('click', () => {
        loadMyBookings();
        openModal('myBookingsModal');
    });
    document.getElementById('closeMyBookings')?.addEventListener('click', () => closeModal('myBookingsModal'));
}

function logout() {
    currentUser = null;
    localStorage.removeItem('aeroturf_user');
    updateAuthUI();
    showToast('info', 'You have been logged out.');
}

function updateAuthUI() {
    const btnAuth       = document.getElementById('btnAuth');
    const btnMyBookings = document.getElementById('btnMyBookings');
    const userMenu      = document.getElementById('userMenu');
    // Mobile
    const btnAuthMobile       = document.getElementById('btnAuthMobile');
    const btnMyBookingsMobile = document.getElementById('btnMyBookingsMobile');
    const btnLogoutMobile     = document.getElementById('btnLogoutMobile');

    if (currentUser) {
        btnAuth.style.display       = 'none';
        btnMyBookings.style.display = 'flex';
        userMenu.style.display      = 'flex';
        document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
        document.getElementById('userName').textContent   = currentUser.name.split(' ')[0];
        // Mobile
        if (btnAuthMobile)       btnAuthMobile.style.display       = 'none';
        if (btnMyBookingsMobile) btnMyBookingsMobile.style.display  = 'flex';
        if (btnLogoutMobile)     btnLogoutMobile.style.display      = 'flex';
    } else {
        btnAuth.style.display       = 'flex';
        btnMyBookings.style.display = 'none';
        userMenu.style.display      = 'none';
        // Mobile
        if (btnAuthMobile)       btnAuthMobile.style.display       = 'flex';
        if (btnMyBookingsMobile) btnMyBookingsMobile.style.display  = 'none';
        if (btnLogoutMobile)     btnLogoutMobile.style.display      = 'none';
    }
}

// ==================== MY BOOKINGS / HISTORY ====================
async function loadMyBookings() {
    const list = document.getElementById('myBookingsList');
    if (!currentUser) {
        list.innerHTML = '<div class="no-bookings"><i class="fas fa-user-lock"></i><p>Please sign in to view your bookings.</p></div>';
        return;
    }
    list.innerHTML = '<div class="no-bookings"><i class="fas fa-spinner fa-spin"></i><p>Loading...</p></div>';
    try {
        const res  = await fetch(`${API}/api/bookings?email=${encodeURIComponent(currentUser.email)}`);
        const json = await res.json();
        if (json.success) {
            allMyBookings = json.data || [];
            renderBookingHistory('all');
        } else {
            list.innerHTML = '<div class="no-bookings"><i class="fas fa-exclamation-triangle"></i><p>Failed to load bookings.</p></div>';
        }
    } catch {
        list.innerHTML = '<div class="no-bookings"><i class="fas fa-exclamation-triangle"></i><p>Network error. Please try again.</p></div>';
    }
}

function renderBookingHistory(statusFilter) {
    const list = document.getElementById('myBookingsList');
    let bookings = allMyBookings;
    if (statusFilter !== 'all') bookings = bookings.filter(b => b.status === statusFilter);

    if (bookings.length === 0) {
        list.innerHTML = '<div class="no-bookings"><i class="fas fa-calendar-xmark"></i><p>' +
            (statusFilter === 'all'
                ? 'No bookings yet. Explore venues and book your first game!'
                : `No ${statusFilter} bookings found.`) +
            '</p></div>';
        return;
    }

    list.innerHTML = bookings.map(b => {
        const bookingDate = new Date(b.date + 'T00:00:00');
        const isPast = bookingDate < new Date().setHours(0,0,0,0);
        const statusLabel = b.status === 'confirmed' ? (isPast ? 'Completed' : 'Upcoming') : 'Cancelled';
        const statusClass = b.status === 'cancelled' ? 'cancelled' : (isPast ? 'completed' : 'confirmed');
        const players = b.num_players || 1;
        const total   = (b.price || 0) * players;
        return `
        <div class="my-booking-card" data-id="${b.id}">
            <div class="my-booking-sport-icon sport-tag-${(b.sport || '').toLowerCase()}">
                <i class="fas ${getSportIcon(b.sport)}"></i>
            </div>
            <div class="my-booking-info">
                <h4>${b.venue_name || b.venueName || 'Venue'}</h4>
                <p><i class="fas fa-calendar"></i> ${bookingDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} &nbsp;•&nbsp; ${b.slot}</p>
                <p><i class="fas fa-users"></i> ${players} player${players > 1 ? 's' : ''} &nbsp;•&nbsp; <i class="fas fa-trophy"></i> ${b.sport}</p>
                <p class="booking-amount"><i class="fas fa-indian-rupee-sign"></i> ₹${total} total</p>
            </div>
            <div class="my-booking-actions">
                <span class="my-booking-status ${statusClass}">${statusLabel}</span>
                ${b.status === 'confirmed' && !isPast
                    ? `<button class="btn-cancel-booking" onclick="cancelBooking('${b.id}', this)">
                         <i class="fas fa-times"></i> Cancel
                       </button>`
                    : ''}
            </div>
        </div>`;
    }).join('');
}

function getSportIcon(sport) {
    const icons = {
        cricket: 'fa-baseball-ball', football: 'fa-futbol', kabaddi: 'fa-hand-fist',
        gym: 'fa-dumbbell', tennis: 'fa-table-tennis-paddle-ball', badminton: 'fa-shuttlecock'
    };
    return icons[(sport || '').toLowerCase()] || 'fa-trophy';
}

async function cancelBooking(id, btnEl) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    btnEl.disabled  = true;
    btnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    try {
        const res  = await fetch(`${API}/api/bookings/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
            showToast('info', 'Booking cancelled.');
            // Update local state
            const booking = allMyBookings.find(b => String(b.id) === String(id));
            if (booking) booking.status = 'cancelled';
            const activeTab = document.querySelector('.booking-filter-tab.active')?.dataset.status || 'all';
            renderBookingHistory(activeTab);
        } else {
            showToast('error', json.message || 'Cancellation failed.');
            btnEl.disabled  = false;
            btnEl.innerHTML = '<i class="fas fa-times"></i> Cancel';
        }
    } catch {
        showToast('error', 'Network error. Please try again.');
        btnEl.disabled  = false;
        btnEl.innerHTML = '<i class="fas fa-times"></i> Cancel';
    }
}

// Booking history filter tabs
document.getElementById('bookingsFilterTabs')?.addEventListener('click', (e) => {
    const tab = e.target.closest('.booking-filter-tab');
    if (!tab) return;
    document.querySelectorAll('.booking-filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderBookingHistory(tab.dataset.status);
});

// ==================== TESTIMONIAL CAROUSEL ====================
function initTestimonials() {
    const track      = document.getElementById('testimonialTrack');
    const dotsEl     = document.getElementById('carouselDots');
    const prevBtn    = document.getElementById('prevTestimonial');
    const nextBtn    = document.getElementById('nextTestimonial');
    if (!track) return;
    const cards = track.querySelectorAll('.testimonial-card');
    const total = cards.length;
    for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
        dot.addEventListener('click', () => goTo(i));
        dotsEl.appendChild(dot);
    }
    function goTo(idx) {
        testimonialIndex = idx;
        track.style.transform = `translateX(-${idx * 100}%)`;
        dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
    }
    prevBtn?.addEventListener('click', () => goTo((testimonialIndex - 1 + total) % total));
    nextBtn?.addEventListener('click', () => goTo((testimonialIndex + 1) % total));
    setInterval(() => goTo((testimonialIndex + 1) % total), 5000);
}

// ==================== STATS COUNTER ====================
function initStatsCounter() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.stat-number').forEach(counter => {
                    animateCounter(counter, parseInt(counter.dataset.target));
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    const sec = document.getElementById('stats');
    if (sec) observer.observe(sec);
}

function animateCounter(el, target) {
    const step = target / (2000 / 16);
    let current = 0;
    function update() {
        current += step;
        if (current < target) { el.textContent = Math.floor(current); requestAnimationFrame(update); }
        else el.textContent = target;
    }
    update();
}

// ==================== MODAL HELPERS ====================
function openModal(id) {
    document.getElementById(id)?.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeModal(id) {
    document.getElementById(id)?.classList.remove('active');
    document.body.style.overflow = '';
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('active')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        document.body.style.overflow = '';
    }
});

// ==================== TOAST ====================
function showToast(type, message) {
    const container = document.getElementById('toastContainer');
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${icons[type]}"></i><span class="toast-message">${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3600);
}
