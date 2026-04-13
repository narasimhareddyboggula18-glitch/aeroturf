require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
// fs not needed — venues loaded via require()
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Supabase ──────────────────────────────────────────────────────────────────
// Fallbacks prevent 500 crashes if you forget to add variables in Vercel Dashboard
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'placeholder_key';
const supabase = createClient(supabaseUrl, supabaseKey);

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Static venue data (bundled at deploy time — works in Vercel serverless) ────
function getVenues() {
    return require('./data/venues.json');
}

// ═════════════════════════════════════════════════════════════════════════════
//  VENUES API
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/venues  — list all, optionally filtered
app.get('/api/venues', (req, res) => {
    let venues = getVenues();
    const { sport, type, search } = req.query;

    if (sport && sport !== 'all')
        venues = venues.filter(v => v.sport.toLowerCase() === sport.toLowerCase());
    if (type && type !== 'all')
        venues = venues.filter(v => v.type.toLowerCase() === type.toLowerCase());
    if (search) {
        const q = search.toLowerCase();
        venues = venues.filter(v =>
            v.title.toLowerCase().includes(q) ||
            v.sport.toLowerCase().includes(q) ||
            v.location.toLowerCase().includes(q) ||
            v.city.toLowerCase().includes(q)
        );
    }

    res.json({ success: true, data: venues, count: venues.length });
});

// GET /api/venues/:id
app.get('/api/venues/:id', (req, res) => {
    const venue = getVenues().find(v => v.id === parseInt(req.params.id));
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
    res.json({ success: true, data: venue });
});

// GET /api/venues/:id/slots?date=YYYY-MM-DD
app.get('/api/venues/:id/slots', async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'date is required' });

    const venue = getVenues().find(v => v.id === parseInt(req.params.id));
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });

    // Fetch booked slots from Supabase
    const { data: booked, error } = await supabase
        .from('bookings')
        .select('slot')
        .eq('venue_id', venue.id)
        .eq('date', date)
        .eq('status', 'confirmed');

    if (error) return res.status(500).json({ success: false, message: error.message });

    const bookedSlots = (booked || []).map(b => b.slot);
    const availableSlots = venue.slots.map(slot => ({
        time: slot,
        available: !bookedSlots.includes(slot)
    }));

    res.json({ success: true, data: availableSlots, venue: venue.title, date });
});

// ═════════════════════════════════════════════════════════════════════════════
//  BOOKINGS API  (persisted in Supabase)
// ═════════════════════════════════════════════════════════════════════════════

// POST /api/bookings  — create a booking
app.post('/api/bookings', async (req, res) => {
    const { venueId, date, slot, userName, userEmail, userPhone } = req.body;

    if (!venueId || !date || !slot || !userName || !userEmail)
        return res.status(400).json({ success: false, message: 'Missing required fields' });

    const venue = getVenues().find(v => v.id === parseInt(venueId));
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });

    // Check for double-booking
    const { data: existing } = await supabase
        .from('bookings')
        .select('id')
        .eq('venue_id', parseInt(venueId))
        .eq('date', date)
        .eq('slot', slot)
        .eq('status', 'confirmed')
        .single();

    if (existing) return res.status(409).json({ success: false, message: 'This slot is already booked' });

    // Insert into Supabase
    const { data: booking, error } = await supabase
        .from('bookings')
        .insert([{
            venue_id:   parseInt(venueId),
            venue_name: venue.title,
            sport:      venue.sport,
            date,
            slot,
            price:      venue.price,
            user_name:  userName,
            user_email: userEmail,
            user_phone: userPhone || '',
            status:     'confirmed'
        }])
        .select()
        .single();

    if (error) return res.status(500).json({ success: false, message: error.message });

    res.status(201).json({ success: true, data: booking, message: 'Booking confirmed!' });
});

// GET /api/bookings?email=…  — get bookings for a user
app.get('/api/bookings', async (req, res) => {
    const { email } = req.query;
    let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (email) query = query.eq('user_email', email);

    const { data, error } = await query;
    if (error) return res.status(500).json({ success: false, message: error.message });

    res.json({ success: true, data: data || [], count: (data || []).length });
});

// DELETE /api/bookings/:id  — cancel a booking
app.delete('/api/bookings/:id', async (req, res) => {
    const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', req.params.id);

    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, message: 'Booking cancelled' });
});

// ═════════════════════════════════════════════════════════════════════════════
//  AUTH API  — proxy to Supabase Auth (email + password)
// ═════════════════════════════════════════════════════════════════════════════

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ success: false, message: 'Name, email and password are required' });

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, phone: phone || '' } }
    });

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.status(201).json({
        success: true,
        message: 'Account created! Check your email to confirm.',
        data: {
            id:    data.user?.id,
            name,
            email: data.user?.email,
            phone: phone || ''
        }
    });
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ success: false, message: 'Email and password are required' });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return res.status(401).json({ success: false, message: error.message });

    const meta = data.user?.user_metadata || {};
    res.json({
        success: true,
        message: 'Login successful!',
        data: {
            id:    data.user.id,
            name:  meta.name  || email.split('@')[0],
            email: data.user.email,
            phone: meta.phone || ''
        }
    });
});

// ═════════════════════════════════════════════════════════════════════════════
//  STATS
// ═════════════════════════════════════════════════════════════════════════════
app.get('/api/stats', async (req, res) => {
    const venues  = getVenues();
    const { count: bookingCount } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'confirmed');

    res.json({
        success: true,
        data: {
            totalVenues:   venues.length,
            totalBookings: bookingCount || 0,
            totalSports:   [...new Set(venues.map(v => v.sport))].length,
            totalCities:   [...new Set(venues.map(v => v.city))].length
        }
    });
});

// ── SPA fallback ─────────────────────────────────────────────────────────────
// NOTE: On Vercel, static files in /public are served by the CDN directly.
// This catch-all only runs when no static file matches (e.g. deep-link routes).
// We redirect to root so Vercel's static layer serves public/index.html.
app.get('*', (req, res) => {
    // Avoid redirect loop on API paths
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ success: false, message: 'API route not found' });
    }
    res.redirect('/');
});

// ── Start (local) / Export (Vercel) ──────────────────────────────────────────
if (require.main === module) {
    app.listen(PORT, () =>
        console.log(`\n  🏟️  AeroTurf running at http://localhost:${PORT}\n`)
    );
}

module.exports = app;
