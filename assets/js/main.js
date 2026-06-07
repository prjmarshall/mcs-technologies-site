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
