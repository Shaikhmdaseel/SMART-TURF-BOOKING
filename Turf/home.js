// Global variables
let currentUser = null;
let isLoggedIn = false;
let currentModal = null;
let googleUser = null;

// Pricing configuration
const bookingPrices = {
    morning: 500,
    afternoon: 700,
    evening: 800,
    night: 1200
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initializeAuth();
    animateStats();
});

// Initialize authentication state
async function initializeAuth() {
    try {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            isLoggedIn = true;
            updateUIAfterLogin();
            updateDashboardData();
            updateAdminData();
        }
        
        // Set up Firebase Auth state listener
        if (window.firebaseAuth) {
            const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js');
            onAuthStateChanged(window.firebaseAuth, (user) => {
                if (user) {
                    currentUser = {
                        id: user.uid,
                        name: user.displayName || user.email.split('@')[0],
                        email: user.email,
                        photoURL: user.photoURL,
                        emailVerified: user.emailVerified
                    };
                    isLoggedIn = true;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    updateUIAfterLogin();
                    updateDashboardData();
                    updateAdminData();
                } else {
                    currentUser = null;
                    isLoggedIn = false;
                    localStorage.removeItem('currentUser');
                    updateUIAfterLogout();
                }
            });
        }
    } catch (error) {
        console.error('Error initializing auth:', error);
    }
}

// Update UI after logout
function updateUIAfterLogout() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const dashboardLink = document.getElementById('dashboardLink');
    
    if (authButtons) authButtons.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
    
    if (dashboardLink) {
        dashboardLink.parentElement.remove();
    }

    // Hide dashboard
    const mainContent = document.getElementById('mainContent');
    const dashboard = document.getElementById('dashboard');
    if (mainContent) mainContent.style.display = 'block';
    if (dashboard) dashboard.classList.remove('active');
}

// Initialize application
function initializeApp() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        dateInput.min = today;
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(15, 23, 42, 0.98)';
        } else {
            navbar.style.background = 'rgba(15, 23, 42, 0.95)';
        }
    });

    // Close modal when clicking outside
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal-overlay')) {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                activeModal.classList.remove('active');
                document.body.style.overflow = 'auto';
                currentModal = null;
            }
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && currentModal) {
            closeModal(currentModal);
        }
    });
    
    // Initialize slot status
    updateSlotStatus();
}

// Initialize local data for demo purposes
function initializeLocalData() {
    console.log('Initializing local demo data');
    // This will be handled by Firebase Auth and simple local storage for demo
}

// Authentication Functions
function openModal(type, preset = null) {
    currentModal = type;
    const modal = document.getElementById(type + 'Modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Pre-fill booking modal if preset is provided
        if (type === 'booking' && preset) {
            const timeSlot = document.getElementById('timeSlot');
            if (timeSlot) {
                timeSlot.value = preset;
                updatePricing();
            }
        }
    }
}

function closeModal(type) {
    const modal = document.getElementById(type + 'Modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        currentModal = null;
    }
}

function switchModal(from, to) {
    closeModal(from);
    setTimeout(() => openModal(to), 300);
}

// Handle Login with Firebase
async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;

    try {
        // Use Firebase Auth for login
        const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js');
        const userCredential = await signInWithEmailAndPassword(window.firebaseAuth, email, password);
        const user = userCredential.user;
        
        currentUser = {
            id: user.uid,
            name: user.displayName || email.split('@')[0],
            email: user.email,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified
        };
        
        isLoggedIn = true;
        closeModal('login');
        updateUIAfterLogin();
        showSuccessMessage('Login successful!');
        
        // Store user data in localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update dashboard and admin data
        updateDashboardData();
        updateAdminData();
        
    } catch (error) {
        console.error('Login error:', error);
        showSuccessMessage('Login failed: ' + error.message, 'error');
    }
}

// Handle Register with Firebase
async function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('input[name="full_name"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;

    try {
        // Use Firebase Auth for registration
        const { createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js');
        const userCredential = await createUserWithEmailAndPassword(window.firebaseAuth, email, password);
        const user = userCredential.user;
        
        // Update user profile with name
        await updateProfile(user, {
            displayName: name
        });
        
        currentUser = {
            id: user.uid,
            name: name,
            email: user.email,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified
        };
        
        isLoggedIn = true;
        closeModal('register');
        updateUIAfterLogin();
        showSuccessMessage('Account created successfully!');
        
        // Store user data in localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update dashboard and admin data
        updateDashboardData();
        updateAdminData();
        
    } catch (error) {
        console.error('Registration error:', error);
        showSuccessMessage('Registration failed: ' + error.message, 'error');
    }
}

// Handle Booking (Demo version)
async function handleBooking(event) {
    event.preventDefault();
    console.log('🔔 Booking form submitted!');
    
    if (!isLoggedIn) {
        console.log('❌ User not logged in');
        showSuccessMessage('Please login to make a booking', 'error');
        return;
    }
    
    console.log('✅ User is logged in:', currentUser);

    const form = event.target;
    const userEmail = document.getElementById('userEmail').value;
    const username = document.getElementById('username').value;
    const sportType = document.getElementById('sportType').value;
    const bookingDate = document.getElementById('bookingDate').value;
    const timeSlot = document.getElementById('timeSlot').value;
    const duration = parseInt(document.getElementById('duration').value);
    const vehicleType = document.getElementById('vehicleType').value;
    const requirements = form.querySelector('textarea').value;

    // Calculate pricing
    const hourlyRate = bookingPrices[timeSlot] || 0;
    const subtotal = hourlyRate * duration;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;

    // Create booking object
    const newBooking = {
        id: Date.now(),
        userId: currentUser.id,
        userName: username || currentUser.name,
        userEmail: userEmail || currentUser.email,
        sport: sportType,
        slotName: `${sportType} Turf A`,
        date: bookingDate,
        timeSlot: timeSlot,
        duration: duration,
        startTime: getStartTime(timeSlot),
        endTime: getEndTime(timeSlot, duration),
        amount: subtotal,
        tax: tax,
        total: total,
        status: 'confirmed',
        vehicleType: vehicleType,
        requirements: requirements,
        bookingDate: new Date().toISOString(),
        paymentStatus: 'paid'
    };

    // Store in localStorage for demo
    let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(newBooking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    // Send data to PHP backend
    try {
        const formData = new FormData();
        formData.append('username', username || currentUser.name);
        formData.append('user_email', userEmail || currentUser.email);
        formData.append('sport_type', sportType);
        formData.append('booking_date', bookingDate);
        formData.append('time_slot', timeSlot);
        formData.append('duration', duration);
        formData.append('total_amount', total);

        console.log('Sending booking data to database:', {
            username: username || currentUser.name,
            user_email: userEmail || currentUser.email,
            sport_type: sportType,
            booking_date: bookingDate,
            time_slot: timeSlot,
            duration: duration,
            total_amount: total
        });

        const response = await fetch('saveBooking.php', {
            method: 'POST',
            body: formData
        });

        const responseText = await response.text();
        console.log('Raw response from server:', responseText);
        
        try {
            const result = JSON.parse(responseText);
            if (result.status === 'success') {
                console.log('✅ Booking saved to database successfully!', result);
                showSuccessMessage('Booking saved to database!');
            } else {
                console.error('❌ Database error:', result);
                showSuccessMessage('Database error: ' + result.message, 'error');
            }
        } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError);
            console.error('Response text:', responseText);
        }
    } catch (error) {
        console.error('❌ Network error saving to database:', error);
        showSuccessMessage('Network error: ' + error.message, 'error');
    }

    showBookingConfirmation(newBooking);
    form.reset();
    
    // Reset pricing display
    document.getElementById('subtotal').textContent = '₹0';
    document.getElementById('tax').textContent = '₹0';
    document.getElementById('total').textContent = '₹0';
    
    // Update dashboard and admin data
    updateDashboardData();
    updateAdminData();
    
    showSuccessMessage('Booking created successfully!');
}

// Get start time based on time slot
function getStartTime(timeSlot) {
    const times = {
        morning: '06:00',
        afternoon: '10:00',
        evening: '16:00',
        night: '20:00'
    };
    return times[timeSlot] || '06:00';
}

// Get end time based on time slot and duration
function getEndTime(timeSlot, duration) {
    const startTimes = {
        morning: 6,
        afternoon: 10,
        evening: 16,
        night: 20
    };
    const startHour = startTimes[timeSlot] || 6;
    const endHour = startHour + duration;
    return `${endHour.toString().padStart(2, '0')}:00`;
}

// Show booking confirmation
function showBookingConfirmation(booking) {
    const bookingDetails = document.getElementById('bookingDetails');
    bookingDetails.innerHTML = `
        <h4>Booking Details</h4>
        <p><strong>Booking ID:</strong> #${booking.id}</p>
        <p><strong>Sport:</strong> ${booking.sport}</p>
        <p><strong>Slot:</strong> ${booking.slotName}</p>
        <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
        <p><strong>Duration:</strong> ${booking.duration} hour(s)</p>
        <p><strong>Amount:</strong> ₹${booking.total.toLocaleString()}</p>
        <p><strong>Status:</strong> ${booking.status}</p>
    `;
    
    openModal('confirmation');
}

// Update UI after login
function updateUIAfterLogin() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const userWelcome = document.getElementById('userWelcome');
    const dashboardWelcome = document.getElementById('dashboardWelcome');

    if (authButtons) authButtons.style.display = 'none';
    if (userMenu) {
        userMenu.style.display = 'flex';
        userMenu.style.alignItems = 'center';
        userMenu.style.gap = '1rem';
    }
    if (userWelcome) userWelcome.textContent = `Welcome, ${currentUser.name}!`;
    
    if (dashboardWelcome) {
        dashboardWelcome.textContent = `Welcome back, ${currentUser.name}! Here's your overview.`;
    }

    // Add dashboard link to nav
    const navLinks = document.getElementById('navLinks');
    if (navLinks && !document.getElementById('dashboardLink')) {
        const dashboardLink = document.createElement('li');
        dashboardLink.innerHTML = '<a href="#" id="dashboardLink" onclick="showDashboard()">Dashboard</a>';
        navLinks.appendChild(dashboardLink);
    }

    // Update dashboard data
    updateDashboardData();
    
    // Auto-fill booking form if available
    const userEmailField = document.getElementById('userEmail');
    const usernameField = document.getElementById('username');
    if (userEmailField && currentUser) {
        userEmailField.value = currentUser.email;
    }
    if (usernameField && currentUser) {
        usernameField.value = currentUser.name;
    }
}

// Logout function with Firebase
async function logout() {
    try {
        // Sign out from Firebase
        const { signOut } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js');
        await signOut(window.firebaseAuth);
        
        currentUser = null;
        isLoggedIn = false;
        googleUser = null;
        
        // Clear localStorage
        localStorage.removeItem('currentUser');
        
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        const dashboardLink = document.getElementById('dashboardLink');
        
        authButtons.style.display = 'flex';
        userMenu.style.display = 'none';
        
        if (dashboardLink) {
            dashboardLink.parentElement.remove();
        }

        // Hide dashboard
        document.getElementById('mainContent').style.display = 'block';
        document.getElementById('dashboard').classList.remove('active');

        showSuccessMessage('Logged out successfully!');
    } catch (error) {
        console.error('Logout error:', error);
        showSuccessMessage('Logout failed', 'error');
    }
}

// Show Dashboard
function showDashboard() {
    if (!isLoggedIn) {
        showSuccessMessage('Please login to access dashboard', 'error');
        return;
    }

    const mainContent = document.getElementById('mainContent');
    const dashboard = document.getElementById('dashboard');
    
    if (mainContent) mainContent.style.display = 'none';
    if (dashboard) dashboard.classList.add('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    updateDashboardData();
}

// Update dashboard data
function updateDashboardData() {
    if (!currentUser) return;

    try {
        // Load user bookings from localStorage
        const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const userBookings = allBookings.filter(b => b.userId === currentUser.id);
        const totalBookings = userBookings.length;
        const monthlyBookings = userBookings.filter(b => {
            const bookingDate = new Date(b.bookingDate);
            const currentDate = new Date();
            return bookingDate.getMonth() === currentDate.getMonth() && 
                   bookingDate.getFullYear() === currentDate.getFullYear();
        }).length;
        
        const totalSpent = userBookings.reduce((sum, b) => sum + b.total, 0);
        const favoriteSport = getFavoriteSport(userBookings);

        const totalBookingsEl = document.getElementById('totalBookings');
        const monthlyBookingsEl = document.getElementById('monthlyBookings');
        const totalSpentEl = document.getElementById('totalSpent');
        const favoriteSportEl = document.getElementById('favoriteSport');

        if (totalBookingsEl) totalBookingsEl.textContent = totalBookings;
        if (monthlyBookingsEl) monthlyBookingsEl.textContent = monthlyBookings;
        if (totalSpentEl) totalSpentEl.textContent = `₹${totalSpent.toLocaleString()}`;
        if (favoriteSportEl) favoriteSportEl.textContent = favoriteSport;

        // Update recent activity
        updateRecentActivity(userBookings);
        
        // Update user bookings
        updateUserBookings(userBookings);
        
        // Update receipts
        updateUserReceipts(userBookings);
        
        // Update admin data
        updateAdminData();

    } catch (error) {
        console.error('Error updating dashboard data:', error);
    }
}

// Get user bookings from localStorage
function getUserBookings() {
    try {
        const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        return allBookings.filter(b => b.userId === currentUser.id);
    } catch (error) {
        console.error('Error getting user bookings:', error);
        return [];
    }
}

// Get favorite sport from bookings
function getFavoriteSport(userBookings) {
    if (userBookings.length === 0) return '-';
    
    const sportCounts = {};
    userBookings.forEach(booking => {
        sportCounts[booking.sport] = (sportCounts[booking.sport] || 0) + 1;
    });
    
    return Object.keys(sportCounts).reduce((a, b) => 
        sportCounts[a] > sportCounts[b] ? a : b
    );
}

// Update recent activity
function updateRecentActivity(userBookings) {
    const recentActivity = document.getElementById('recentActivity');
    const recentBookings = userBookings.slice(-3).reverse();
    
    if (recentBookings.length === 0) {
        recentActivity.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">No recent activity</p>';
        return;
    }
    
    recentActivity.innerHTML = recentBookings.map(booking => `
        <div class="booking-item">
            <div>
                <strong>${booking.sport} - ${booking.slotName}</strong><br>
                <small>${new Date(booking.date).toLocaleDateString()}, ${booking.startTime} - ${booking.endTime}</small>
            </div>
            <div class="booking-status status-${booking.status}">${booking.status}</div>
        </div>
    `).join('');
}

// Update user bookings
function updateUserBookings(userBookings) {
    const userBookingsContainer = document.getElementById('userBookings');
    
    if (userBookings.length === 0) {
        userBookingsContainer.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">No bookings found</p>';
        return;
    }
    
    userBookingsContainer.innerHTML = userBookings.map(booking => `
        <div class="booking-item">
            <div>
                <strong>${booking.sport} - ${booking.slotName}</strong><br>
                <small>${new Date(booking.date).toLocaleDateString()}, ${booking.startTime} - ${booking.endTime}</small><br>
                <small style="color: #10b981;">₹${booking.total.toLocaleString()}</small>
            </div>
            <div>
                <div class="booking-status status-${booking.status}">${booking.status}</div>
                ${booking.status === 'confirmed' ? 
                    `<button onclick="cancelBooking(${booking.id})" style="margin-top: 0.5rem; background: #ef4444; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer;">Cancel</button>` :
                    ''
                }
                ${booking.status === 'confirmed' ? 
                    `<button onclick="downloadReceipt(${booking.id})" style="margin-top: 0.5rem; background: #10b981; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer;">Receipt</button>` :
                    ''
                }
            </div>
        </div>
    `).join('');
}

// Update user receipts
function updateUserReceipts(userBookings) {
    const userReceiptsContainer = document.getElementById('userReceipts');
    const paidBookings = userBookings.filter(b => b.paymentStatus === 'paid');
    
    if (paidBookings.length === 0) {
        userReceiptsContainer.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">No receipts available</p>';
        return;
    }
    
    userReceiptsContainer.innerHTML = paidBookings.map(booking => `
        <div class="booking-item">
            <div>
                <strong>Receipt #${booking.id}</strong><br>
                <small>${booking.sport} - ${booking.slotName}</small><br>
                <small>${new Date(booking.date).toLocaleDateString()}, ${booking.startTime} - ${booking.endTime}</small><br>
                <small style="color: #10b981;">₹${booking.total.toLocaleString()}</small>
            </div>
            <div>
                <div class="booking-status status-confirmed">Paid</div>
                <button onclick="downloadReceipt(${booking.id})" style="margin-top: 0.5rem; background: #10b981; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer;">Download</button>
            </div>
        </div>
    `).join('');
}

// Update admin data (simplified)
function updateAdminData() {
    const today = new Date().toISOString().split('T')[0];
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const todayBookings = allBookings.filter(b => b.date === today);
    const todayRevenue = todayBookings.reduce((sum, b) => sum + b.total, 0);

    const adminTodayBookingsEl = document.getElementById('adminTodayBookings');
    const adminTodayRevenueEl = document.getElementById('adminTodayRevenue');
    const adminActiveUsersEl = document.getElementById('adminActiveUsers');
    const adminPendingApprovalsEl = document.getElementById('adminPendingApprovals');

    if (adminTodayBookingsEl) adminTodayBookingsEl.textContent = todayBookings.length;
    if (adminTodayRevenueEl) adminTodayRevenueEl.textContent = `₹${todayRevenue.toLocaleString()}`;
    if (adminActiveUsersEl) adminActiveUsersEl.textContent = '1'; // Demo value
    if (adminPendingApprovalsEl) adminPendingApprovalsEl.textContent = '0'; // Demo value
    
    // Update admin slot management and bookings
    updateAdminSlotManagement();
    updateAdminBookings();
    updateUserManagement();
}

// Dashboard section navigation
function showDashboardSection(section) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(s => {
        s.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.dashboard-nav-links a').forEach(a => {
        a.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(section).classList.add('active');
    
    // Add active class to clicked nav link
    event.target.classList.add('active');
}

// Admin section navigation
function showAdminSection(section) {
    // Hide all admin sections
    document.querySelectorAll('.admin-section').forEach(s => {
        s.classList.remove('active');
    });
    
    // Remove active class from all admin tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById('admin' + section.charAt(0).toUpperCase() + section.slice(1)).classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
}

// Update booking pricing
function updatePricing() {
    const timeSlot = document.getElementById('timeSlot').value;
    const duration = parseInt(document.getElementById('duration').value) || 0;
    
    if (!timeSlot || !duration) {
        document.getElementById('subtotal').textContent = '₹0';
        document.getElementById('tax').textContent = '₹0';
        document.getElementById('total').textContent = '₹0';
        return;
    }

    const hourlyRate = bookingPrices[timeSlot] || 0;
    const subtotal = hourlyRate * duration;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;

    document.getElementById('subtotal').textContent = `₹${subtotal.toLocaleString()}`;
    document.getElementById('tax').textContent = `₹${tax.toLocaleString()}`;
    document.getElementById('total').textContent = `₹${total.toLocaleString()}`;
}

// Render slots (demo version)
function renderSlots() {
    const slotsGrid = document.getElementById('slotsGrid');
    if (!slotsGrid) return;

    const demoSlots = [
        { name: 'Football Turf A', sport: 'Football', status: 'available', capacity: 10 },
        { name: 'Cricket Ground B', sport: 'Cricket', status: 'available', capacity: 22 },
        { name: 'Basketball Court C', sport: 'Basketball', status: 'available', capacity: 10 }
    ];

    slotsGrid.innerHTML = demoSlots.map(slot => `
        <div class="slot-card ${slot.status}" data-slot-id="${slot.name}">
            <div class="slot-header">
                <div class="slot-name">${slot.name}</div>
                <div class="slot-status ${slot.status}">${slot.status}</div>
            </div>
            <div class="slot-info">
                <p><strong>Sport:</strong> ${slot.sport}</p>
                <p><strong>Capacity:</strong> ${slot.capacity} players</p>
                <p><strong>Facilities:</strong> Changing Room, Equipment, Parking</p>
                <p><strong>Last Maintenance:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
        </div>
    `).join('');
}

// Render slot status (demo version)
function renderSlotStatus() {
    const slotStatusGrid = document.getElementById('slotStatusGrid');
    if (!slotStatusGrid) return;

    slotStatusGrid.innerHTML = `
        <div class="slot-status-item available">
            <div>Available</div>
            <div>3</div>
        </div>
        <div class="slot-status-item booked">
            <div>Booked</div>
            <div>0</div>
        </div>
        <div class="slot-status-item maintenance">
            <div>Maintenance</div>
            <div>0</div>
        </div>
    `;
}

// Update slot status
function updateSlotStatus() {
    renderSlots();
    renderSlotStatus();
}

// Filter slots
function filterSlots(filter) {
    const slotCards = document.querySelectorAll('.slot-card');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Update active filter button
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter slots
    slotCards.forEach(card => {
        const status = card.classList.contains('available') ? 'available' : 
                      card.classList.contains('booked') ? 'booked' : 'maintenance';
        
        if (filter === 'all' || status === filter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Simplified admin functions for demo
function updateAdminSlotManagement() {
    const adminSlotGrid = document.getElementById('adminSlotGrid');
    if (!adminSlotGrid) return;

    const demoSlots = [
        { name: 'Football Turf A', sport: 'Football', status: 'available', capacity: 10 },
        { name: 'Cricket Ground B', sport: 'Cricket', status: 'available', capacity: 22 },
        { name: 'Basketball Court C', sport: 'Basketball', status: 'available', capacity: 10 }
    ];

    adminSlotGrid.innerHTML = demoSlots.map(slot => `
        <div class="admin-slot-card ${slot.status}">
            <div class="slot-header">
                <div class="slot-name">${slot.name}</div>
                <div class="slot-status ${slot.status}">${slot.status}</div>
            </div>
            <div class="slot-info">
                <p><strong>Sport:</strong> ${slot.sport}</p>
                <p><strong>Capacity:</strong> ${slot.capacity}</p>
            </div>
            <div class="slot-controls">
                <button class="btn-available" onclick="showSuccessMessage('Slot status updated to available')">Available</button>
                <button class="btn-booked" onclick="showSuccessMessage('Slot status updated to booked')">Booked</button>
                <button class="btn-maintenance" onclick="showSuccessMessage('Slot status updated to maintenance')">Maintenance</button>
            </div>
        </div>
    `).join('');
}

// Update admin bookings (demo version)
function updateAdminBookings() {
    const adminBookingsList = document.getElementById('adminBookingsList');
    if (!adminBookingsList) return;

    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    if (allBookings.length === 0) {
        adminBookingsList.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">No bookings found</p>';
        return;
    }

    adminBookingsList.innerHTML = allBookings.map(booking => `
        <div class="booking-item">
            <div>
                <strong>${booking.userName} - ${booking.sport}</strong><br>
                <small>${booking.slotName}</small><br>
                <small>${new Date(booking.date).toLocaleDateString()}, ${booking.startTime} - ${booking.endTime}</small><br>
                <small style="color: #10b981;">₹${booking.total.toLocaleString()}</small>
            </div>
            <div>
                <div class="booking-status status-${booking.status}">${booking.status}</div>
            </div>
        </div>
    `).join('');
}

// Filter admin bookings (demo version)
function filterAdminBookings() {
    updateAdminBookings();
}

// Update user management (demo version)
function updateUserManagement() {
    const userList = document.getElementById('userList');
    if (!userList) return;

    userList.innerHTML = `
        <div class="user-item">
            <div>
                <strong>Demo User</strong><br>
                <small>demo@example.com</small><br>
                <small>+91 98765 43210</small>
            </div>
            <div>
                <div style="margin-bottom: 0.5rem;">
                    <small>Bookings: 0</small><br>
                    <small>Spent: ₹0</small>
                </div>
                <button onclick="showSuccessMessage('User details viewed')" style="background: #10b981; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer;">View Details</button>
            </div>
        </div>
    `;
}

// Cancel booking (demo version)
function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        try {
            const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
            const bookingIndex = allBookings.findIndex(b => b.id === bookingId);
            
            if (bookingIndex !== -1) {
                allBookings[bookingIndex].status = 'cancelled';
                localStorage.setItem('bookings', JSON.stringify(allBookings));
                
                updateDashboardData();
                updateAdminData();
                showSuccessMessage('Booking cancelled successfully!');
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            showSuccessMessage('Failed to cancel booking', 'error');
        }
    }
}

// Download receipt as PDF with QR code
async function downloadReceipt(bookingId) {
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const booking = allBookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Create QR code data
    const qrData = {
        bookingId: booking.id,
        duration: booking.duration,
        startTime: booking.startTime,
        sport: booking.sport
    };
    const qrUrl = `${window.location.origin}/Turf1/timer.html?data=${encodeURIComponent(JSON.stringify(qrData))}`;

    // Generate QR code using QR Server API
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`;

    // Load jsPDF library dynamically
    if (!window.jspdf) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => generatePDF();
        document.head.appendChild(script);
    } else {
        generatePDF();
    }

    function generatePDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add header
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('TURFMASTER PRO', 105, 20, { align: 'center' });
        
        doc.setFontSize(16);
        doc.text('BOOKING RECEIPT', 105, 30, { align: 'center' });
        
        // Add line
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);

        // Receipt details
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        
        let y = 45;
        doc.setFont(undefined, 'bold');
        doc.text(`Receipt No: #${booking.id}`, 20, y);
        y += 7;
        doc.text(`Date: ${new Date(booking.bookingDate).toLocaleDateString()}`, 20, y);
        
        // Customer Details
        y += 15;
        doc.setFontSize(12);
        doc.text('Customer Details:', 20, y);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        y += 7;
        doc.text(`Name: ${booking.userName}`, 20, y);
        y += 6;
        doc.text(`Email: ${booking.userEmail || 'N/A'}`, 20, y);

        // Booking Details
        y += 15;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Booking Details:', 20, y);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        y += 7;
        doc.text(`Sport: ${booking.sport}`, 20, y);
        y += 6;
        doc.text(`Slot: ${booking.slotName}`, 20, y);
        y += 6;
        doc.text(`Date: ${new Date(booking.date).toLocaleDateString()}`, 20, y);
        y += 6;
        doc.text(`Time: ${booking.startTime} - ${booking.endTime}`, 20, y);
        y += 6;
        doc.text(`Duration: ${booking.duration} hour(s)`, 20, y);

        // Payment Details
        y += 15;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Payment Details:', 20, y);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        y += 7;
        doc.text(`Subtotal: ₹${booking.amount.toLocaleString()}`, 20, y);
        y += 6;
        doc.text(`Tax (18% GST): ₹${booking.tax.toLocaleString()}`, 20, y);
        y += 6;
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text(`Total: ₹${booking.total.toLocaleString()}`, 20, y);

        // Status
        y += 10;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Status: ${booking.status.toUpperCase()}`, 20, y);
        y += 6;
        doc.text(`Payment Status: ${booking.paymentStatus.toUpperCase()}`, 20, y);

        // QR Code section
        y += 15;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Scan QR Code to Start Timer:', 20, y);
        
        // Add QR code image
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function() {
            doc.addImage(img, 'PNG', 70, y + 5, 50, 50);
            
            // Footer
            doc.setFontSize(10);
            doc.setFont(undefined, 'italic');
            doc.text('Thank you for choosing TurfMaster Pro!', 105, 280, { align: 'center' });
            
            // Save PDF
            doc.save(`receipt-${booking.id}.pdf`);
            showSuccessMessage('Receipt downloaded successfully!');
        };
        img.onerror = function() {
            // If QR code fails to load, save without it
            doc.text('QR Code: Visit the URL below', 20, y + 10);
            doc.setFontSize(8);
            doc.text(qrUrl, 20, y + 17, { maxWidth: 170 });
            
            doc.setFontSize(10);
            doc.setFont(undefined, 'italic');
            doc.text('Thank you for choosing TurfMaster Pro!', 105, 280, { align: 'center' });
            
            doc.save(`receipt-${booking.id}.pdf`);
            showSuccessMessage('Receipt downloaded successfully!');
        };
        img.src = qrCodeUrl;
    }
}

// Generate reports (demo version)
function generateReport(type) {
    showSuccessMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated successfully!`);
}

// View user details (demo version)
function viewUserDetails(userId) {
    showSuccessMessage('User details viewed successfully!');
}

// Scroll to booking section
function scrollToBooking() {
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('dashboard').classList.remove('active');
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
}

// Animate statistics
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    const animateNumber = (element) => {
        const target = parseInt(element.getAttribute('data-target'));
        const increment = target / 100;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, 20);
    };
    
    // Intersection Observer for triggering animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => observer.observe(stat));
}

// Show success message
function showSuccessMessage(message, type = 'success') {
    const successMessage = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    
    successText.textContent = message;
    
    if (type === 'error') {
        successMessage.style.background = 'linear-gradient(45deg, #ef4444, #dc2626)';
    } else {
        successMessage.style.background = 'linear-gradient(45deg, #10b981, #059669)';
    }
    
    successMessage.classList.add('show');
    
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 3000);
}

// Check if user is signed in with Firebase
function isFirebaseUser() {
    return currentUser && currentUser.id;
}

// Enhanced booking confirmation
function showBookingConfirmation(booking) {
    const bookingDetails = document.getElementById('bookingDetails');
    
    bookingDetails.innerHTML = `
        <h4>Booking Details</h4>
        <p><strong>Booking ID:</strong> #${booking.id}</p>
        <p><strong>Sport:</strong> ${booking.sport}</p>
        <p><strong>Slot:</strong> ${booking.slotName}</p>
        <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
        <p><strong>Duration:</strong> ${booking.duration} hour(s)</p>
        <p><strong>Amount:</strong> ₹${booking.total.toLocaleString()}</p>
        <p><strong>Status:</strong> ${booking.status}</p>
    `;
    
    openModal('confirmation');
}


