const API = '';
let token = localStorage.getItem('token');
let currentUser = null;
let currentView = 'trips';

function $(sel) { return document.querySelector(sel); }

async function api(path, opts = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const res = await fetch(API + path, { ...opts, headers });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Request failed');
    }
    return res.json();
}

function render() {
    if (!token) return renderAuth();
    renderApp();
}

function renderAuth() {
    document.getElementById('app').innerHTML = `
        <div class="container" style="max-width:400px;margin-top:60px">
            <div class="card">
                <h1 style="text-align:center">TripSplit</h1>
                <p style="text-align:center;color:#6b7280;margin-bottom:20px">Split expenses with friends</p>
                <div id="auth-form">
                    <h2 id="auth-title">Login</h2>
                    <input id="auth-name" placeholder="Name" class="hidden">
                    <input id="auth-email" type="email" placeholder="Email" required>
                    <input id="auth-password" type="password" placeholder="Password" required>
                    <button class="btn-primary" style="width:100%" onclick="handleAuth()">Login</button>
                    <p style="text-align:center;margin-top:12px;font-size:14px">
                        <a href="#" onclick="toggleAuth()" style="color:#6366f1">Create an account</a>
                    </p>
                </div>
            </div>
        </div>
    `;
}

let isRegister = false;
window.toggleAuth = function() {
    isRegister = !isRegister;
    document.getElementById('auth-title').textContent = isRegister ? 'Register' : 'Login';
    document.getElementById('auth-name').classList.toggle('hidden', !isRegister);
    document.querySelector('#auth-form button').textContent = isRegister ? 'Register' : 'Login';
    document.querySelector('#auth-form p a').textContent = isRegister ? 'Already have an account?' : 'Create an account';
};

window.handleAuth = async function() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    try {
        let data;
        if (isRegister) {
            const name = document.getElementById('auth-name').value;
            data = await api('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
        } else {
            data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
        }
        token = data.token;
        currentUser = data;
        localStorage.setItem('token', token);
        render();
    } catch (e) {
        alert(e.message);
    }
};

function renderApp() {
    document.getElementById('app').innerHTML = `
        <div class="container">
            <div class="nav">
                <h1>🏝️ TripSplit</h1>
                <div class="nav-actions">
                    <span style="font-size:14px;color:#6b7280">${currentUser?.name || ''}</span>
                    <button class="btn-secondary" onclick="logout()">Logout</button>
                </div>
            </div>
            <div id="content"></div>
        </div>
    `;
    renderTrips();
}

window.logout = function() {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    render();
};

// Trips
async function renderTrips() {
    const trips = await api('/api/trips');
    document.getElementById('content').innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <h2>Your Trips</h2>
            <button class="btn-primary" onclick="showCreateTrip()">+ New Trip</button>
        </div>
        <div id="trip-list">
            ${trips.length === 0 ? '<p style="color:#6b7280">No trips yet. Create one!</p>' :
            trips.map(t => `
                <div class="card trip-card" onclick="showTrip(${t.id})">
                    <div>
                        <strong>${t.name}</strong>
                        ${t.destination ? `<br><span style="font-size:14px;color:#6b7280">📍 ${t.destination}</span>` : ''}
                    </div>
                    <span style="color:#9ca3af">→</span>
                </div>
            `).join('')}
        </div>
    `;
}

window.showCreateTrip = function() {
    document.getElementById('content').innerHTML = `
        <h2>New Trip</h2>
        <div class="card">
            <input id="trip-name" placeholder="Trip name" required>
            <input id="trip-destination" placeholder="Destination">
            <div class="form-row">
                <input id="trip-start" type="date" placeholder="Start date">
                <input id="trip-end" type="date" placeholder="End date">
            </div>
            <button class="btn-primary" onclick="createTrip()">Create</button>
            <button class="btn-secondary" onclick="renderTrips()" style="margin-left:8px">Cancel</button>
        </div>
    `;
};

window.createTrip = async function() {
    const name = document.getElementById('trip-name').value;
    if (!name) return alert('Name is required');
    await api('/api/trips', {
        method: 'POST',
        body: JSON.stringify({
            name,
            destination: document.getElementById('trip-destination').value,
            startDate: document.getElementById('trip-start').value,
            endDate: document.getElementById('trip-end').value
        })
    });
    renderTrips();
};

// Single trip view
window.showTrip = async function(tripId) {
    const trip = await api('/api/trips/' + tripId);
    const members = await api('/api/trips/' + tripId + '/members');
    const expenses = await api('/api/expenses/trip/' + tripId);
    const settlements = await api('/api/settlements/trip/' + tripId);

    document.getElementById('content').innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:16px">
            <div>
                <h2>${trip.name}</h2>
                ${trip.destination ? `<p style="color:#6b7280">📍 ${trip.destination}</p>` : ''}
            </div>
            <button class="btn-secondary" onclick="renderTrips()">← Back</button>
        </div>

        <div class="card">
            <h3>Members</h3>
            <div style="margin-top:8px">
                ${members.map(m => `
                    <span class="tag">User #${m.userId} <span class="badge badge-${m.role}">${m.role}</span></span>
                `).join('')}
            </div>
            <div style="margin-top:12px">
                <input id="invite-email" placeholder="User ID to invite" style="width:auto;display:inline-block">
                <button class="btn-secondary" onclick="addMember(${tripId})">Add</button>
            </div>
        </div>

        <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <h3>Expenses</h3>
                <button class="btn-primary" onclick="showAddExpense(${tripId})">+ Add</button>
            </div>
            <div id="expense-list" style="margin-top:12px">
                ${expenses.length === 0 ? '<p style="color:#6b7280">No expenses yet</p>' :
                expenses.map(e => `
                    <div class="expense-item">
                        <div>
                            <strong>${e.description}</strong>
                            <span style="font-size:13px;color:#6b7280"> — ${e.date}</span>
                            ${e.category ? `<span class="tag">${e.category}</span>` : ''}
                        </div>
                        <strong>₹${Number(e.amount).toFixed(2)}</strong>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <h3>Settlements</h3>
                <button class="btn-secondary" onclick="calculateSettlements(${tripId})">Calculate</button>
            </div>
            <div id="settlement-list" style="margin-top:12px">
                ${settlements.length === 0 ? '<p style="color:#6b7280">No settlements yet. Click Calculate.</p>' :
                settlements.map(s => `
                    <div class="settlement-item">
                        User #${s.fromUserId} → User #${s.toUserId}: <strong>₹${Number(s.amount).toFixed(2)}</strong>
                        ${s.settled ? '✅ Settled' : '⏳ Pending'}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};

window.addMember = async function(tripId) {
    const userId = document.getElementById('invite-email').value;
    if (!userId) return;
    await api('/api/trips/' + tripId + '/members', {
        method: 'POST',
        body: JSON.stringify({ userId })
    });
    showTrip(tripId);
};

window.showAddExpense = function(tripId) {
    document.getElementById('content').innerHTML = `
        <h2>Add Expense</h2>
        <div class="card">
            <input id="expense-desc" placeholder="Description (e.g., Dinner)" required>
            <input id="expense-amount" type="number" step="0.01" placeholder="Amount" required>
            <input id="expense-date" type="date" required>
            <input id="expense-category" placeholder="Category (e.g., Food, Transport)">
            <button class="btn-primary" onclick="addExpense(${tripId})">Save</button>
            <button class="btn-secondary" onclick="showTrip(${tripId})" style="margin-left:8px">Cancel</button>
        </div>
    `;
    document.getElementById('expense-date').valueAsDate = new Date();
};

window.addExpense = async function(tripId) {
    const desc = document.getElementById('expense-desc').value;
    const amount = document.getElementById('expense-amount').value;
    const date = document.getElementById('expense-date').value;
    if (!desc || !amount) return alert('Description and amount required');
    await api('/api/expenses', {
        method: 'POST',
        body: JSON.stringify({ tripId, description: desc, amount: parseFloat(amount), date, category: document.getElementById('expense-category').value })
    });
    showTrip(tripId);
};

window.calculateSettlements = async function(tripId) {
    const result = await api('/api/settlements/trip/' + tripId + '/calculate', { method: 'POST' });
    const list = document.getElementById('settlement-list');
    if (result.length === 0) {
        list.innerHTML = '<p style="color:#6b7280">All settled up!</p>';
    } else {
        list.innerHTML = result.map(s => `
            <div class="settlement-item">
                User #${s.from} → User #${s.to}: <strong>₹${Number(s.amount).toFixed(2)}</strong>
            </div>
        `).join('');
    }
};

render();
