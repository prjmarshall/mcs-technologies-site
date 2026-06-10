const year = document.getElementById("year");

if (year) {
    year.textContent = new Date().getFullYear();
}

function initParticleGrid() {
    const canvas = document.getElementById('hero-particles');
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];
    let animationId = null;

    const LINK_DISTANCE = 130;
    const POINTER = { x: null, y: null, radius: 150 };

    function particleCount() {
        return Math.min(90, Math.round((width * height) / 14000));
    }

    function createParticles() {
        particles = [];
        const count = particleCount();
        for (let i = 0; i < count; i += 1) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 1.6 + 1,
            });
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
        createParticles();
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i += 1) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(186, 230, 253, 0.85)';
            ctx.fill();
        }

        for (let i = 0; i < particles.length; i += 1) {
            for (let j = i + 1; j < particles.length; j += 1) {
                const a = particles[i];
                const b = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.hypot(dx, dy);
                if (dist < LINK_DISTANCE) {
                    const alpha = (1 - dist / LINK_DISTANCE) * 0.5;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(125, 211, 252, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }

            if (POINTER.x !== null) {
                const p = particles[i];
                const dx = p.x - POINTER.x;
                const dy = p.y - POINTER.y;
                const dist = Math.hypot(dx, dy);
                if (dist < POINTER.radius) {
                    const alpha = (1 - dist / POINTER.radius) * 0.7;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(POINTER.x, POINTER.y);
                    ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        animationId = window.requestAnimationFrame(draw);
    }

    function start() {
        if (animationId === null) {
            animationId = window.requestAnimationFrame(draw);
        }
    }

    function stop() {
        if (animationId !== null) {
            window.cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    const hero = canvas.closest('.hero');
    if (hero) {
        hero.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            POINTER.x = event.clientX - rect.left;
            POINTER.y = event.clientY - rect.top;
        });
        hero.addEventListener('mouseleave', () => {
            POINTER.x = null;
            POINTER.y = null;
        });
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

initParticleGrid();

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
