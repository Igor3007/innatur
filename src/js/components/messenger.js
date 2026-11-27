document.addEventListener('DOMContentLoaded', function () {
    const btn = document.querySelector('.messenger-btn');
    const links = document.querySelector('.messenger-links');

    if (!btn || !links) return;

    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        links.classList.toggle('show');
        btn.classList.toggle('show');
    });

    // Закрываем при клике вне виджета
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.messenger')) {
            links.classList.remove('show');
            btn.classList.remove('show');
        }
    });
});
