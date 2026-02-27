// ==================== SLOT BOOKING SYSTEM ====================
// This system manages slot bookings with real-time conflict detection

// Initialize bookings from localStorage
let bookings = JSON.parse(localStorage.getItem('bookings')) || [];

// ==================== UTILITY FUNCTIONS ====================

/**
 * Check if two time slots overlap
 * @param {string} startTime1 - Start time in HH:MM format
 * @param {string} endTime1 - End time in HH:MM format
 * @param {string} startTime2 - Start time in HH:MM format
 * @param {string} endTime2 - End time in HH:MM format
 * @returns {boolean} True if slots overlap
 */
function doSlotsOverlap(startTime1, endTime1, startTime2, endTime2) {
    const start1 = timeToMinutes(startTime1);
    const end1 = timeToMinutes(endTime1);
    const start2 = timeToMinutes(startTime2);
    const end2 = timeToMinutes(endTime2);

    // Two slots overlap if one starts before the other ends
    return start1 < end2 && start2 < end1;
}

/**
 * Convert time string (HH:MM) to minutes
 * @param {string} time - Time in HH:MM format
 * @returns {number} Total minutes
 */
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Calculate duration between two times
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {string} Duration in human-readable format
 */
function calculateDuration(startTime, endTime) {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    const duration = end - start;

    if (duration < 0) return "Invalid";
    if (duration < 60) return `${duration} mins`;
    
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Format date to readable format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

/**
 * Set minimum date to today
 */
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').setAttribute('min', today);
    document.getElementById('date').value = today;
}

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Validate booking data
 * @param {string} date - Selected date
 * @param {string} startTime - Start time
 * @param {string} endTime - End time
 * @param {string} userName - User name
 * @returns {object} Validation result
 */
function validateBooking(date, startTime, endTime, userName) {
    // Check if end time is after start time
    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
        return {
            valid: false,
            message: "⚠️ End time must be after start time!",
            type: 'error'
        };
    }

    // Check if name is provided
    if (!userName.trim()) {
        return {
            valid: false,
            message: "⚠️ Please enter your name!",
            type: 'error'
        };
    }

    // Check for existing conflicts on the same date
    const conflict = bookings.find(booking => {
        return booking.date === date && 
               doSlotsOverlap(booking.startTime, booking.endTime, startTime, endTime);
    });

    if (conflict) {
        return {
            valid: false,
            message: `❌ Time slot conflicts with ${conflict.userName}'s booking (${conflict.startTime} - ${conflict.endTime})!`,
            type: 'error'
        };
    }

    return { valid: true };
}

// ==================== BOOKING MANAGEMENT ====================

/**
 * Add a new booking
 * @param {string} date - Selected date
 * @param {string} startTime - Start time
 * @param {string} endTime - End time
 * @param {string} userName - User name
 * @returns {boolean} Success status
 */
function addBooking(date, startTime, endTime, userName) {
    const validation = validateBooking(date, startTime, endTime, userName);
    
    if (!validation.valid) {
        showMessage(validation.message, validation.type);
        return false;
    }

    // Create new booking
    const booking = {
        id: Date.now(),
        date,
        startTime,
        endTime,
        userName,
        duration: calculateDuration(startTime, endTime),
        bookedAt: new Date().toLocaleString()
    };

    // Add to bookings array and save to localStorage
    bookings.push(booking);
    bookings.sort((a, b) => {
        if (a.date !== b.date) return new Date(a.date) - new Date(b.date);
        return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    });

    localStorage.setItem('bookings', JSON.stringify(bookings));

    // Show success message
    showMessage(`✅ Slot booked successfully for ${userName}!`, 'success');
    
    // Update UI
    refreshUI();
    return true;
}

/**
 * Delete a booking
 * @param {number} id - Booking ID
 */
function deleteBooking(id) {
    bookings = bookings.filter(booking => booking.id !== id);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    refreshUI();
}

// ==================== UI FUNCTIONS ====================

/**
 * Display message to user
 * @param {string} message - Message text
 * @param {string} type - Message type: 'success', 'error', 'warning'
 */
function showMessage(message, type = 'success') {
    const messageBox = document.getElementById('message');
    messageBox.textContent = message;
    messageBox.className = `message-box show ${type}`;

    // Auto-hide success messages after 4 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageBox.classList.remove('show');
        }, 4000);
    }
}

/**
 * Render all booked slots
 */
function renderBookedSlots() {
    const container = document.getElementById('slotsContainer');

    if (bookings.length === 0) {
        container.innerHTML = '<p class="no-slots">🎉 No bookings yet. Be the first to book!</p>';
        return;
    }

    container.innerHTML = bookings.map(booking => `
        <div class="slot-item">
            <div class="slot-header">
                <span class="slot-date">📅 ${formatDate(booking.date)}</span>
                <span class="slot-name">👤 ${booking.userName}</span>
            </div>
            <div class="slot-time">
                ⏰ ${booking.startTime} - ${booking.endTime}
            </div>
            <span class="slot-duration">⏱️ ${booking.duration}</span>
            <button onclick="deleteBooking(${booking.id})" style="
                background: #ff6b6b;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.85rem;
                margin-top: 10px;
                transition: background 0.2s;
            " onmouseover="this.style.background='#ff5252'" onmouseout="this.style.background='#ff6b6b'">
                🗑️ Cancel
            </button>
        </div>
    `).join('');
}

/**
 * Render time availability timeline for selected date
 */
function renderTimelineForDate() {
    const dateInput = document.getElementById('date').value;
    const container = document.getElementById('timelineContainer');

    if (!dateInput) {
        container.innerHTML = '<p style="color: #999; text-align: center;">Select a date to view availability</p>';
        return;
    }

    const dateBookings = bookings.filter(b => b.date === dateInput);
    
    let html = '';
    for (let hour = 0; hour < 24; hour++) {
        const hourStr = String(hour).padStart(2, '0');
        const nextHourStr = String(hour + 1).padStart(2, '0');
        const startTimeHour = `${hourStr}:00`;
        const endTimeHour = `${nextHourStr}:00`;

        // Check if this hour slot is booked
        const isBooked = dateBookings.some(b => 
            doSlotsOverlap(b.startTime, b.endTime, startTimeHour, endTimeHour)
        );

        const bookedSlot = dateBookings.find(b => 
            doSlotsOverlap(b.startTime, b.endTime, startTimeHour, endTimeHour)
        );

        html += `
            <div class="timeline-hour">
                <div class="timeline-label">${hourStr}:00</div>
                <div class="timeline-bar" title="${isBooked ? `Booked by ${bookedSlot.userName}` : 'Available'}">
                    ${isBooked ? `<div class="timeline-booked" style="width: 100%;">${bookedSlot.userName}</div>` : ''}
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

/**
 * Refresh entire UI
 */
function refreshUI() {
    renderBookedSlots();
    renderTimelineForDate();
}

// ==================== EVENT LISTENERS ====================

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    setMinDate();
    refreshUI();

    // Update timeline when date changes
    document.getElementById('date').addEventListener('change', renderTimelineForDate);

    // Handle form submission
    document.getElementById('bookingForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const date = document.getElementById('date').value;
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        const userName = document.getElementById('userName').value;

        // Try to add booking
        if (addBooking(date, startTime, endTime, userName)) {
            // Clear form on success
            document.getElementById('bookingForm').reset();
            setMinDate();
            renderTimelineForDate();
        }
    });
});

// ==================== END OF SCRIPT ====================
});
