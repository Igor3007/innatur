document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header');

    if (!header) {
        return;
    }

    function checkScroll() {
        if (window.scrollY > 145) {
            header.classList.add('scroll');
        } else {
            header.classList.remove('scroll');
        }
    }

    checkScroll();

    window.addEventListener('scroll', checkScroll);
});

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.openMobMenu');
    const header = document.querySelector('header');

    if (!menuToggle || !header) {
        console.warn('Элементы .openMobMenu или header не найдены');
        return;
    }

    function toggleBodyScroll(disable) {
        if (disable) {
            document.body.style.overflow = 'hidden';
            // Для iOS Safari
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.top = `-${window.scrollY}px`;
        } else {
            const scrollY = document.body.style.top;
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.top = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
    }

    menuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        // Переключаем класс open у header
        header.classList.toggle('open');

        // Переключаем класс is--active у кнопки
        this.classList.toggle('is--active');

        // Блокируем/разблокируем скролл body
        if (header.classList.contains('open')) {
            toggleBodyScroll(true);
        } else {
            toggleBodyScroll(false);
        }
    });

    // Закрытие меню при клике вне его (опционально)
    document.addEventListener('click', function(e) {
        if (header.classList.contains('open')) {
            const isClickInside = header.contains(e.target) || menuToggle.contains(e.target);

            if (!isClickInside) {
                header.classList.remove('open');
                menuToggle.classList.remove('is--active');
                toggleBodyScroll(false);
            }
        }
    });

    // Закрытие меню при нажатии ESC (опционально)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && header.classList.contains('open')) {
            header.classList.remove('open');
            menuToggle.classList.remove('is--active');
            toggleBodyScroll(false);
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const footerTop = document.querySelector('.footerTop');
    const menuMobile = document.querySelector('.MenuMobile');

    if (!footerTop || !menuMobile) {
        console.warn('Элементы .footerTop или .MenuMobile не найдены');
        return;
    }

    // Очищаем и копируем структуру
    menuMobile.innerHTML = '';

    // Создаем глубокую копию
    const clone = footerTop.cloneNode(true);
    menuMobile.appendChild(clone);

    // Добавляем обработчики для элементов внутри скопированного меню (если нужно)
    // Например, для аккордеона в мобильном меню
    const accordionItems = menuMobile.querySelectorAll('.accordion-header');
    accordionItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const parent = this.closest('.accordion-item');
            if (parent) {
                parent.classList.toggle('active');
            }
        });
    });

    console.log('Структура скопирована и обработчики добавлены');
});
