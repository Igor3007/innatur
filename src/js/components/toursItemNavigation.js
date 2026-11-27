document.addEventListener('DOMContentLoaded', function() {
    const calendarInput = document.getElementById('calendarTours');
    if (!calendarInput) return;

    if (typeof VanillaCalendar === 'undefined') return;

    // ===== ВНЕШНЯЯ ОБЁРТКА (позиционируется на странице) =====
    let calendarWrapper = document.querySelector('.calendar-wrapper');

    if (!calendarWrapper) {
        calendarWrapper = document.createElement('div');
        calendarWrapper.className = 'calendar-wrapper calendarDetails';

        document.body.appendChild(calendarWrapper);
    }

    // ===== ВНУТРЕННИЙ КОНТЕЙНЕР ДЛЯ КАЛЕНДАРЯ =====
    // VanillaCalendar будет рендерить сюда и стирать только этот блок
    let calendarContainer = calendarWrapper.querySelector('.calendar-container');
    if (!calendarContainer) {
        calendarContainer = document.createElement('div');
        calendarContainer.className = 'calendar-container';
        calendarWrapper.appendChild(calendarContainer);
    }

    // ===== ФУТЕР С КНОПКОЙ (вне контейнера календаря) =====
    let calendarFooter = calendarWrapper.querySelector('.calendar-footer');
    if (!calendarFooter) {
        calendarFooter = document.createElement('div');
        calendarFooter.className = 'calendar-footer';

        const applyBtn = document.createElement('button');
        applyBtn.type = 'button';
        applyBtn.className = 'calendar-apply-btn btn__green disabled'; // сразу disabled
        applyBtn.textContent = 'Применить';
        applyBtn.disabled = true;
        calendarFooter.appendChild(applyBtn);
        calendarWrapper.appendChild(calendarFooter);
    }

    const applyBtn = calendarFooter.querySelector('.calendar-apply-btn');

    calendarWrapper.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    let pendingDate = null;

    const MONTHS_RU = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];

    function formatDate(date) {
        if (!date) return '';
        const day = date.getDate();
        const month = MONTHS_RU[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    }

    function parseDate(str) {
        if (!str) return null;
        const parts = str.trim().split(' ');
        if (parts.length !== 3) return null;
        const day = parseInt(parts[0], 10);
        const monthIndex = MONTHS_RU.indexOf(parts[1].toLowerCase());
        const year = parseInt(parts[2], 10);
        if (isNaN(day) || monthIndex === -1 || isNaN(year)) return null;
        return new Date(year, monthIndex, day);
    }

    function activateApplyBtn() {
        applyBtn.disabled = false;
        applyBtn.classList.remove('disabled');
    }

    function resetApplyBtn() {
        applyBtn.disabled = true;
        applyBtn.classList.add('disabled');
    }

    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];

    // Инициализация календаря во внутреннем контейнере
    const calendar = new VanillaCalendar(calendarContainer, {
        settings: {
            lang: 'ru',
            iso8601: false,
            theme: 'light',
            visibility: { weekend: true, today: true, disabled: false },
            range: { min: todayISO },
            selection: { day: 'single', time: false }
        },
        actions: {
            clickDay(e, dates) {
                if (dates.selectedDates && dates.selectedDates.length > 0) {
                    pendingDate = new Date(dates.selectedDates[0]);
                    activateApplyBtn();
                    console.log('Выбрана (ожидает применения):', formatDate(pendingDate));
                }
            }
        }
    });

    window.calendarInstance = calendar;
    calendar.init();

    // ===== КЛИК ПО "ПРИМЕНИТЬ" =====
    applyBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (!pendingDate) return;

        const formattedDate = formatDate(pendingDate);
        calendarInput.value = formattedDate;
        calendarInput.dispatchEvent(new Event('change', { bubbles: true }));

        pendingDate = null;
        resetApplyBtn();

        calendarWrapper.style.display = 'none';

        if (window.closeAllSelects) window.closeAllSelects();

        console.log('Применена дата:', formattedDate);
    });

    function updateCalendarPosition() {
        const rect = calendarInput.getBoundingClientRect();
        const spaceBottom = window.innerHeight - rect.bottom;
        const calHeight = calendarWrapper.offsetHeight || 400;

        if (spaceBottom > calHeight) {
            calendarWrapper.style.top = rect.bottom + window.scrollY + 'px';
        } else {
            calendarWrapper.style.top = rect.top + window.scrollY - calHeight + 'px';
        }
        calendarWrapper.style.left = rect.left + window.scrollX + 'px';
    }

    calendarInput.addEventListener('click', function(e) {
        e.stopPropagation();
        if (window.closeAllSelects) window.closeAllSelects();

        if (calendarWrapper.style.display === 'block') {
            calendarWrapper.style.display = 'none';
            pendingDate = null;
            resetApplyBtn();
        } else {
            calendarWrapper.style.display = 'block';
            updateCalendarPosition();
            // После показа пересчитываем позицию, т.к. высота стала известна
            requestAnimationFrame(updateCalendarPosition);
            calendar.update();
        }
    });

    document.addEventListener('click', function(e) {
        const isInside = calendarWrapper.contains(e.target);
        const isInput = e.target === calendarInput;
        if (!isInside && !isInput) {
            calendarWrapper.style.display = 'none';
            pendingDate = null;
            resetApplyBtn();
        }
    });

    window.addEventListener('resize', function() {
        if (calendarWrapper.style.display === 'block') updateCalendarPosition();
    });
    window.addEventListener('scroll', function() {
        if (calendarWrapper.style.display === 'block') updateCalendarPosition();
    }, true);

    console.log('Календарь инициализирован с кнопкой "Применить"');
});


document.addEventListener('DOMContentLoaded', function () {
    // Инпут, куда пишем дату
    const dateInput = document.querySelector('.form__calendarDates input');
    if (!dateInput) return;

    // Делегирование: ловим клик по любой кнопке .btn__green внутри .popup-form__dates
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.popup-form__dates .btn__green');
        if (!btn) return;

        const item = btn.closest('.item');
        const dateEl = item && item.querySelector('.date');
        if (!dateEl) return;

        // 1. Пишем дату в инпут
        dateInput.value = dateEl.textContent.trim();
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));

        // 2. Закрываем модалку через afLightbox
        if (window.afLightbox && typeof window.afLightbox.close === 'function') {
            window.afLightbox.close();
        } else if (window.afLightbox && typeof window.afLightbox.closeAll === 'function') {
            window.afLightbox.closeAll();
        }
    });
});
