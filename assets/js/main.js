const year = document.getElementById("year");

if (year) {
    year.textContent = new Date().getFullYear();
}

function initMatrixRain() {
    const canvas = document.getElementById('hero-particles');
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let columns = [];
    let animationId = null;
    let lastTime = 0;

    const FONT_SIZE = 16;
    const STEP_MS = 55;
    const GLYPHS = '01';

    function buildColumns() {
        const count = Math.ceil(width / FONT_SIZE);
        columns = [];
        for (let i = 0; i < count; i += 1) {
            columns.push(Math.floor((Math.random() * height) / FONT_SIZE) * -1);
        }
    }

    function resize() {
        const rect = canvas.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.font = FONT_SIZE + "px 'Courier New', monospace";
        ctx.textBaseline = 'top';
        buildColumns();
        ctx.clearRect(0, 0, width, height);
    }

    function tick() {
        // Translucent fade leaves a trailing tail behind each glyph.
        ctx.fillStyle = 'rgba(2, 12, 8, 0.12)';
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < columns.length; i += 1) {
            const x = i * FONT_SIZE;
            const y = columns[i] * FONT_SIZE;
            const char = GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));

            // Bright leading glyph.
            ctx.fillStyle = 'rgba(190, 255, 200, 0.95)';
            ctx.fillText(char, x, y);

            // Softer glow just behind the head.
            ctx.fillStyle = 'rgba(34, 197, 94, 0.55)';
            ctx.fillText(GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length)), x, y - FONT_SIZE);

            if (y > height && Math.random() > 0.975) {
                columns[i] = 0;
            } else {
                columns[i] += 1;
            }
        }
    }

    function loop(now) {
        if (now - lastTime >= STEP_MS) {
            lastTime = now;
            tick();
        }
        animationId = window.requestAnimationFrame(loop);
    }

    function start() {
        if (animationId === null) {
            lastTime = 0;
            animationId = window.requestAnimationFrame(loop);
        }
    }

    function stop() {
        if (animationId !== null) {
            window.cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stop();
        } else {
            start();
        }
    });

    resize();
    start();
}

initMatrixRain();

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
