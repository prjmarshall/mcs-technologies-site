const year = document.getElementById("year");

if (year) {
    year.textContent = new Date().getFullYear();
}

const serviceButtons = document.querySelectorAll('.service-card-button');
serviceButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const card = button.closest('.service-card');
        const expanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!expanded));
        card.classList.toggle('expanded', !expanded);
    });
});

const bookingTimesContainer = document.getElementById('booking-times');
const bookingCalendar = document.getElementById('booking-calendar');
const bookingSubmit = document.getElementById('booking-submit');
const bookingConfirmation = document.getElementById('booking-confirmation');

let selectedDate = null;
let selectedTime = null;

const businessTimes = [
    '8:30 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM',
    '12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM','5:00 PM'
];

function renderBookingTimes() {
    if (!bookingTimesContainer) return;
    bookingTimesContainer.innerHTML = businessTimes.map((time) => {
        return `<button type="button" class="time-slot" data-time="${time}">${time}</button>`;
    }).join('');

    const timeButtons = bookingTimesContainer.querySelectorAll('.time-slot');
    timeButtons.forEach((button) => {
        button.addEventListener('click', () => {
            timeButtons.forEach((btn) => btn.classList.remove('selected'));
            button.classList.add('selected');
            selectedTime = button.dataset.time;
            updateConfirmation();
        });
    });
}

function initializeBookingCalendar() {
    if (!bookingCalendar) return;
    const dateButtons = bookingCalendar.querySelectorAll('.calendar-day');
    dateButtons.forEach((button) => {
        button.addEventListener('click', () => {
            dateButtons.forEach((btn) => btn.classList.remove('selected', 'calendar-day--active'));
            button.classList.add('selected');
            selectedDate = button.dataset.date;
            updateConfirmation();
        });
        if (button.classList.contains('calendar-day--active')) {
            button.classList.add('selected');
            selectedDate = button.dataset.date;
        }
    });
}

function updateConfirmation(message) {
    if (!bookingConfirmation) return;
    if (message) {
        bookingConfirmation.textContent = message;
        return;
    }
    if (selectedDate && selectedTime) {
        bookingConfirmation.textContent = `Selected appointment: ${selectedDate} at ${selectedTime}. Click Book Appointment to confirm your request.`;
    } else if (selectedDate) {
        bookingConfirmation.textContent = `Selected day: ${selectedDate}. Please choose a time.`;
    } else if (selectedTime) {
        bookingConfirmation.textContent = `Selected time: ${selectedTime}. Please choose a day.`;
    } else {
        bookingConfirmation.textContent = 'Choose a day and time to book your appointment.';
    }
}

if (bookingTimesContainer && bookingCalendar && bookingSubmit && bookingConfirmation) {
    renderBookingTimes();
    initializeBookingCalendar();
    updateConfirmation();

    bookingSubmit.addEventListener('click', () => {
        if (!selectedDate || !selectedTime) {
            updateConfirmation('Please select both a date and a time slot before booking.');
            return;
        }

        bookingConfirmation.textContent = `Appointment requested for ${selectedDate} at ${selectedTime}. We will contact you to confirm.`;
        bookingSubmit.textContent = 'Requested';
        bookingSubmit.disabled = true;
    });
}
