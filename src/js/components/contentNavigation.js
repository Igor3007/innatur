document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.contentNavigation__menu_item');

    menuItems.forEach(item => {
        const title = item.querySelector('.contentNavigation__menu_item-title');

        if (!title) return;

        title.addEventListener('click', function(e) {
            e.preventDefault();
            item.classList.toggle('hideBlock');
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const openBtn = document.querySelector('.openMobileCategory');
    const closeBtn = document.querySelector('.contentNavigationBox__header_close');
    const navigationBox = document.querySelector('.contentNavigation');

    if (!openBtn || !closeBtn || !navigationBox) {
        return;
    }

    // Открытие меню
    openBtn.addEventListener('click', function(e) {
        e.preventDefault();
        navigationBox.classList.add('open');
        document.body.style.overflow = 'hidden'; // Блокируем скролл
    });

    // Закрытие меню
    closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        navigationBox.classList.remove('open');
        document.body.style.overflow = ''; // Возвращаем скролл
    });

    // Закрытие при клике на overlay (если есть)
    const overlay = navigationBox.querySelector('.contentNavigationBox__overlay');
    if (overlay) {
        overlay.addEventListener('click', function() {
            navigationBox.classList.remove('open');
            document.body.style.overflow = '';
        });
    }

    // Закрытие при нажатии ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navigationBox.classList.contains('open')) {
            navigationBox.classList.remove('open');
            document.body.style.overflow = '';
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // ===== ПРОВЕРКА НА НАЛИЧИЕ КАЛЕНДАРЯ НА СТРАНИЦЕ =====
    const calendarInput = document.getElementById('calendar');
    if (!calendarInput) {
        return;
    }

    // Проверяем, загружен ли VanillaCalendar
    if (typeof VanillaCalendar === 'undefined') {
        return;
    }

    let calendarContainer = document.querySelector('.calendar-container');
    if (!calendarContainer) {
        calendarContainer = document.createElement('div');
        calendarContainer.className = 'calendar-container';
        calendarContainer.style.cssText = `
            position: absolute;
            display: none;
            z-index: 1000;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            padding: 16px;
            min-width: 280px;
        `;
        document.body.appendChild(calendarContainer);
    }

    function formatDate(date) {
        if (!date) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];

    const calendar = new VanillaCalendar(calendarContainer, {
        settings: {
            lang: 'ru',
            iso8601: false,
            visibility: {
                weekend: true,
                today: true,
                disabled: false
            },
            range: {
                min: todayISO,
            },
            selection: {
                day: 'single',
                time: false
            }
        },
        actions: {
            clickDay(e, dates) {
                if (dates.selectedDates && dates.selectedDates.length > 0) {
                    const selectedDate = new Date(dates.selectedDates[0]);
                    const formattedDate = formatDate(selectedDate);

                    calendarInput.value = formattedDate;

                    const changeEvent = new Event('change', { bubbles: true });
                    calendarInput.dispatchEvent(changeEvent);

                    calendarContainer.style.display = 'none';

                    // Закрываем все селекты
                    if (window.closeAllSelects) {
                        window.closeAllSelects();
                    }

                    console.log(`Выбрана дата: ${formattedDate}`);
                }
            }
        }
    });

    window.calendarInstance = calendar;
    calendar.init();

    function updateCalendarPosition() {
        const rect = calendarInput.getBoundingClientRect();
        const spaceBottom = window.innerHeight - rect.bottom;
        const calHeight = 350;

        if (spaceBottom > calHeight) {
            calendarContainer.style.top = rect.bottom + window.scrollY + 'px';
            calendarContainer.style.left = rect.left + window.scrollX + 'px';
        } else {
            calendarContainer.style.top = rect.top + window.scrollY - calHeight + 'px';
            calendarContainer.style.left = rect.left + window.scrollX + 'px';
        }
    }

    calendarInput.addEventListener('click', function(e) {
        e.stopPropagation();

        // Закрываем все селекты
        if (window.closeAllSelects) {
            window.closeAllSelects();
        }

        if (calendarContainer.style.display === 'block') {
            calendarContainer.style.display = 'none';
        } else {
            updateCalendarPosition();
            calendarContainer.style.display = 'block';
            calendar.update();
        }
    });

    document.addEventListener('click', function(e) {
        const isCalendarClick = calendarContainer.contains(e.target);
        const isInputClick = e.target === calendarInput;

        if (!isCalendarClick && !isInputClick) {
            calendarContainer.style.display = 'none';
        }
    });

    window.addEventListener('resize', function() {
        if (calendarContainer.style.display === 'block') {
            updateCalendarPosition();
        }
    });

    window.addEventListener('scroll', function() {
        if (calendarContainer.style.display === 'block') {
            updateCalendarPosition();
        }
    });

    console.log('Календарь успешно инициализирован');
});
