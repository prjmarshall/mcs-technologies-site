const year = document.getElementById("year");

if (year) {
    year.textContent = new Date().getFullYear();
}

function initCircuitBoard() {
    const canvas = document.getElementById('hero-particles');
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let animationId = null;

    const GRID = 46;
    let edges = [];
    let pulses = [];

    // Offscreen layer holds the static circuit traces + pads (re-rendered on resize)
    const bg = document.createElement('canvas');
    const bgCtx = bg.getContext('2d');

    function buildBoard() {
        const cols = Math.ceil(width / GRID) + 1;
        const rows = Math.ceil(height / GRID) + 1;

        // Decide which grid intersections host a node
        const present = [];
        for (let c = 0; c < cols; c += 1) {
            present[c] = [];
            for (let r = 0; r < rows; r += 1) {
                present[c][r] = Math.random() < 0.55;
            }
        }

        const nodeAt = (c, r) => ({ x: c * GRID, y: r * GRID });

        edges = [];
        for (let c = 0; c < cols; c += 1) {
            for (let r = 0; r < rows; r += 1) {
                if (!present[c][r]) continue;
                // Connect rightward / downward to adjacent nodes (orthogonal traces)
                if (c + 1 < cols && present[c + 1][r] && Math.random() < 0.7) {
                    const a = nodeAt(c, r);
                    const b = nodeAt(c + 1, r);
                    edges.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, len: GRID });
                }
                if (r + 1 < rows && present[c][r + 1] && Math.random() < 0.7) {
                    const a = nodeAt(c, r);
                    const b = nodeAt(c, r + 1);
                    edges.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, len: GRID });
                }
            }
        }

        // Render static traces + solder pads to the offscreen layer
        bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        bgCtx.clearRect(0, 0, width, height);

        bgCtx.lineWidth = 1.1;
        bgCtx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
        for (let i = 0; i < edges.length; i += 1) {
            const e = edges[i];
            bgCtx.beginPath();
            bgCtx.moveTo(e.ax, e.ay);
            bgCtx.lineTo(e.bx, e.by);
            bgCtx.stroke();
        }

        for (let c = 0; c < cols; c += 1) {
            for (let r = 0; r < rows; r += 1) {
                if (!present[c][r]) continue;
                const { x, y } = nodeAt(c, r);
                if (Math.random() < 0.22) {
                    // Larger solder pad with ring
                    bgCtx.fillStyle = 'rgba(125, 211, 252, 0.55)';
                    bgCtx.beginPath();
                    bgCtx.arc(x, y, 2.6, 0, Math.PI * 2);
                    bgCtx.fill();
                    bgCtx.strokeStyle = 'rgba(125, 211, 252, 0.30)';
                    bgCtx.lineWidth = 1;
                    bgCtx.beginPath();
                    bgCtx.arc(x, y, 5, 0, Math.PI * 2);
                    bgCtx.stroke();
                } else {
                    bgCtx.fillStyle = 'rgba(148, 197, 253, 0.35)';
                    bgCtx.fillRect(x - 1.2, y - 1.2, 2.4, 2.4);
                }
            }
        }

        // Spawn data pulses traveling along traces
        const count = Math.min(46, Math.round(edges.length * 0.09) + 6);
        pulses = [];
        for (let i = 0; i < count; i += 1) {
            pulses.push(spawnPulse());
        }
    }

    function spawnPulse() {
        const edge = edges.length ? edges[Math.floor(Math.random() * edges.length)] : null;
        return {
            edge,
            t: Math.random(),
            speed: 0.010 + Math.random() * 0.018,
            forward: Math.random() < 0.5,
        };
    }

    function resize() {
        const rect = canvas.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        bg.width = canvas.width;
        bg.height = canvas.height;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        buildBoard();
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(bg, 0, 0, width, height);

        const TAIL = 26;
        for (let i = 0; i < pulses.length; i += 1) {
            const p = pulses[i];
            if (!p.edge) { pulses[i] = spawnPulse(); continue; }

            p.t += p.speed;
            if (p.t >= 1) { pulses[i] = spawnPulse(); continue; }

            const e = p.edge;
            const sx = p.forward ? e.ax : e.bx;
            const sy = p.forward ? e.ay : e.by;
            const dxn = (p.forward ? e.bx - e.ax : e.ax - e.bx);
            const dyn = (p.forward ? e.by - e.ay : e.ay - e.by);
            const hx = sx + dxn * p.t;
            const hy = sy + dyn * p.t;
            const len = Math.hypot(dxn, dyn) || 1;
            const tx = hx - (dxn / len) * TAIL;
            const ty = hy - (dyn / len) * TAIL;

            const grad = ctx.createLinearGradient(tx, ty, hx, hy);
            grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
            grad.addColorStop(1, 'rgba(125, 211, 252, 0.85)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 2.2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(hx, hy);
            ctx.stroke();

            ctx.shadowColor = 'rgba(56, 189, 248, 0.95)';
            ctx.shadowBlur = 10;
            ctx.fillStyle = 'rgba(224, 242, 254, 1)';
            ctx.beginPath();
            ctx.arc(hx, hy, 1.9, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
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

initCircuitBoard();

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
