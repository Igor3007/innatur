
var ZBRangeSlider = function (id) {
    var self = this;
    var startX = 0,
        x = 0;

    // retrieve touch button
    var slider = document.getElementById(id)
    var touchLeft = slider.querySelector('.slider-touch-left');
    var touchRight = slider.querySelector('.slider-touch-right');
    var lineSpan = slider.querySelector('.slider-line span');

    // get some properties
    var min = parseFloat(slider.getAttribute('se-min'));
    var max = parseFloat(slider.getAttribute('se-max'));

    // retrieve default values
    var defaultMinValue = min;
    if (slider.hasAttribute('se-min-value')) {
        defaultMinValue = parseFloat(slider.getAttribute('se-min-value'));
    }
    var defaultMaxValue = max;
    if (slider.hasAttribute('se-max-value')) {
        defaultMaxValue = parseFloat(slider.getAttribute('se-max-value'));
    }

    // check values are correct
    if (defaultMinValue < min) {
        defaultMinValue = min;
    }
    if (defaultMaxValue > max) {
        defaultMaxValue = max;
    }
    if (defaultMinValue > defaultMaxValue) {
        defaultMinValue = defaultMaxValue;
    }

    var step = 0.0;
    if (slider.getAttribute('se-step')) {
        step = Math.abs(parseFloat(slider.getAttribute('se-step')));
    }

    // normalize flag - ширина кнопки
    var normalizeFact = 26;

    self.slider = slider;

    self.reset = function () {
        touchLeft.style.left = '0px';
        touchRight.style.left = (slider.offsetWidth - touchRight.offsetWidth) + 'px';
        lineSpan.style.marginLeft = '0px';
        lineSpan.style.width = (slider.offsetWidth - touchLeft.offsetWidth) + 'px';
        startX = 0;
        x = 0;
    };

    self.setMinValue = function (minValue) {
        // Проверка границ
        if (minValue < min) minValue = min;
        var currentMax = parseFloat(slider.getAttribute('se-max-value')) || max;
        if (minValue > currentMax) minValue = currentMax;

        // Расчет позиции левого ползунка
        var ratio = (minValue - min) / (max - min);
        var maxPosition = slider.offsetWidth - touchLeft.offsetWidth;
        var position = Math.round(ratio * maxPosition);

        touchLeft.style.left = position + 'px';
        lineSpan.style.marginLeft = position + 'px';

        var rightPosition = parseFloat(touchRight.style.left) || (slider.offsetWidth - touchRight.offsetWidth);
        lineSpan.style.width = (rightPosition - position) + 'px';

        slider.setAttribute('se-min-value', minValue);
    }
    function isMobileWidth() {
        return window.innerWidth <= 524;
    }

    self.setMaxValue = function (maxValue) {
        // Проверка границ
        if (maxValue > max) maxValue = max;
        var currentMin = parseFloat(slider.getAttribute('se-min-value')) || min;
        if (maxValue < currentMin) maxValue = currentMin;

        // Расчет позиции правого ползунка
        var ratio = (maxValue - min) / (max - min);
        var maxPosition = slider.offsetWidth - touchRight.offsetWidth;

        // Для мобильных устройств уменьшаем maxPosition на 32px
        if (isMobileWidth()) {
            maxPosition = slider.offsetWidth - touchRight.offsetWidth - 32;
        }

        var position = Math.round(ratio * maxPosition);

        touchRight.style.left = position + 'px';

        var leftPosition = parseFloat(touchLeft.style.left) || 0;
        lineSpan.style.marginLeft = leftPosition + 'px';
        lineSpan.style.width = (position - leftPosition) + 'px';

        slider.setAttribute('se-max-value', maxValue);
    };

    // initial reset
    self.reset();

    // usefull values
    var maxX = slider.offsetWidth - touchRight.offsetWidth;
    var selectedTouch = null;
    var initialValue = slider.offsetWidth - touchLeft.offsetWidth;

    // set default values
    self.setMinValue(defaultMinValue);
    self.setMaxValue(defaultMaxValue);

    function onStart(event) {
        // Prevent default dragging of selected content
        event.preventDefault();
        var eventTouch = event;

        if (event.touches) {
            eventTouch = event.touches[0];
        }

        if (this === touchLeft) {
            x = touchLeft.offsetLeft;
        } else {
            x = touchRight.offsetLeft;
        }

        startX = eventTouch.pageX - x;
        selectedTouch = this;

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onStop);
        document.addEventListener('touchmove', onMove);
        document.addEventListener('touchend', onStop);
    }

    function onMove(event) {
        document.body.classList.add('dragged-slider')

        var eventTouch = event;
        if (event.touches) {
            eventTouch = event.touches[0];
        }

        x = eventTouch.pageX - startX;

        if (selectedTouch === touchLeft) {
            // Ограничения для левого ползунка
            var rightPos = parseFloat(touchRight.style.left) || (slider.offsetWidth - touchRight.offsetWidth);
            var minX = 0;
            var maxX = rightPos - touchLeft.offsetWidth + 2; // +2 для небольшого перекрытия

            if (x < minX) x = minX;
            if (x > maxX) x = maxX;

            touchLeft.style.left = x + 'px';
        } else if (selectedTouch === touchRight) {
            // Ограничения для правого ползунка
            var leftPos = parseFloat(touchLeft.style.left) || 0;
            var minX = leftPos + touchLeft.offsetWidth - 2; // -2 для небольшого перекрытия
            var maxX = slider.offsetWidth - touchRight.offsetWidth;

            if (x < minX) x = minX;
            if (x > maxX) x = maxX;

            touchRight.style.left = x + 'px';
        }

        // update line span
        var leftPos = parseFloat(touchLeft.style.left) || 0;
        var rightPos = parseFloat(touchRight.style.left) || (slider.offsetWidth - touchRight.offsetWidth);

        lineSpan.style.marginLeft = leftPos + 'px';
        lineSpan.style.width = (rightPos - leftPos) + 'px';

        // write new value
        calculateValue();

        // call on change
        if (slider.getAttribute('on-change')) {
            var fn = new Function('min, max', slider.getAttribute('on-change'));
            fn(slider.getAttribute('se-min-value'), slider.getAttribute('se-max-value'));
        }

        if (self.onChange) {
            self.onChange(slider.getAttribute('se-min-value'), slider.getAttribute('se-max-value'));
        }
    }

    function onStop(event) {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onStop);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onStop);

        setTimeout(() => {
            document.body.classList.toggle('dragged-slider', false)
        }, 300)

        selectedTouch = null;

        // write new value
        calculateValue();

        // call did changed
        if (slider.getAttribute('did-changed')) {
            var fn = new Function('min, max', slider.getAttribute('did-changed'));
            fn(slider.getAttribute('se-min-value'), slider.getAttribute('se-max-value'));
        }

        if (self.didChanged) {
            self.didChanged(slider.getAttribute('se-min-value'), slider.getAttribute('se-max-value'));
        }
    }

    function calculateValue() {
        var leftPos = parseFloat(touchLeft.style.left) || 0;
        var rightPos = parseFloat(touchRight.style.left) || (slider.offsetWidth - touchRight.offsetWidth);

        var maxPosition = slider.offsetWidth - touchLeft.offsetWidth;

        // Расчет значений на основе позиций
        var leftRatio = leftPos / maxPosition;
        var rightRatio = rightPos / maxPosition;

        var calculatedMin = min + leftRatio * (max - min);
        var calculatedMax = min + rightRatio * (max - min);

        // Применение шага
        if (step > 0) {
            calculatedMin = Math.round(calculatedMin / step) * step;
            calculatedMax = Math.round(calculatedMax / step) * step;
        }

        // Округление до 2 знаков после запятой
        calculatedMin = Math.round(calculatedMin * 100) / 100;
        calculatedMax = Math.round(calculatedMax * 100) / 100;

        // Проверка границ
        if (calculatedMin < min) calculatedMin = min;
        if (calculatedMax > max) calculatedMax = max;
        if (calculatedMin > calculatedMax) calculatedMin = calculatedMax;

        slider.setAttribute('se-min-value', calculatedMin);
        slider.setAttribute('se-max-value', calculatedMax);
    }

    // link events
    touchLeft.addEventListener('mousedown', onStart);
    touchRight.addEventListener('mousedown', onStart);
    touchLeft.addEventListener('touchstart', onStart);
    touchRight.addEventListener('touchstart', onStart);
};
document.addEventListener('DOMContentLoaded', function() {




    if (!document.querySelector('.contentNavigation__menu')) {
        return;
    }

    if (document.querySelector('.filter-properties')) {

        const container = document.querySelector('.contentNavigation__menu');
        if (container) {
            const subMenus = container.querySelectorAll('.filter-properties__list ul');

            subMenus.forEach(ul => {
                const items = ul.querySelectorAll('li');

                if (items.length > 5) {
                    items.forEach((item, index) => {
                        if (index >= 5) item.classList.add('hidden');
                    });

                    const hiddenCount = items.length - 5;
                    const toggleBtn = document.createElement('div');
                    toggleBtn.classList.add('sub-menu-toggle');
                    // toggleBtn.innerHTML = `Ещё <span>${hiddenCount}</span> <i class="icon"></i>`;
                    toggleBtn.innerHTML = `Показать все <i class="icon"></i>`;

                    toggleBtn.addEventListener('click', (event) => {
                        event.stopPropagation();

                        ul.classList.toggle('is-open');
                        toggleBtn.classList.toggle('is-open');

                        const isOpen = ul.classList.contains('is-open');

                        items.forEach((item, index) => {
                            if (index >= 5) {
                                item.classList.toggle('hidden', !isOpen);
                            }
                        });

                        toggleBtn.innerHTML = isOpen ?
                            `Свернуть <i class="icon"></i>` :
                            `Показать все <i class="icon"></i>`;
                        `<!--Ещё <span>${hiddenCount}</span> <i class="icon"></i>-->`;
                    });

                    ul.after(toggleBtn);
                }
            });
        }

    }


    // ============================================
    // Хранилище для всех слайдеров
    // ============================================
    const sliders = {};

    function delimiter(num) {
        return String(num).replace(/(\d)(?=(\d{3})+([^\d]|$))/g, '$1 ');
    }

    // ============================================
    // Инициализация слайдера для дней
    // ============================================
    function initDaySlider() {
        try {
            if (typeof ZBRangeSlider === 'undefined') {
                console.warn('ZBRangeSlider не загружен');
                return;
            }

            const sliderContainer = document.getElementById('day-slider');
            if (!sliderContainer) {
                console.warn('Контейнер слайдера #day-slider не найден');
                return;
            }

            if (sliders.day) {
                return;
            }

            console.log('Создаем слайдер для дней...');
            const daySlider = new ZBRangeSlider('day-slider');
            sliders.day = daySlider;

            const inputMax = document.querySelector('[data-day-range="max"]');
            const inputMin = document.querySelector('[data-day-range="min"]');

            const dayMinOriginal = parseFloat(sliderContainer.getAttribute('se-min')) || 1;
            const dayMaxOriginal = parseFloat(sliderContainer.getAttribute('se-max')) || 16;

            if (inputMax) inputMax.value = delimiter(dayMaxOriginal);
            if (inputMin) inputMin.value = delimiter(dayMinOriginal);

            daySlider.onChange = function(min, max) {
                if (inputMax) inputMax.value = delimiter(Math.round(max)) ;
                if (inputMin) inputMin.value = delimiter(Math.round(min)) ;
                console.log('onChange дней', min, max);
            };

            // Обработчики для inputMin дней
            if (inputMin) {
                inputMin.addEventListener('input', function(e) {
                    e.target.value = e.target.value.replace(/[^\d]/g, '');
                });

                inputMin.addEventListener('blur', function(e) {
                    let int = parseFloat(e.target.value.replace(/[^\d]/g, ''));

                    if (isNaN(int)) {
                        int = dayMinOriginal;
                    }

                    let maxInputValue = inputMax ? parseFloat(inputMax.value.replace(/[^\d]/g, '')) : dayMaxOriginal;
                    if (isNaN(maxInputValue)) {
                        maxInputValue = dayMaxOriginal;
                    }

                    if (int < dayMinOriginal) {
                        int = dayMinOriginal;
                    }
                    if (int > dayMaxOriginal) {
                        int = dayMaxOriginal;
                    }
                    if (int > maxInputValue) {
                        int = maxInputValue;
                    }

                    e.target.value = delimiter(int);
                    if (daySlider) {
                        daySlider.setMinValue(int);
                        if (typeof daySlider.onChange === 'function') {
                            const currentMax = parseFloat(daySlider.slider.getAttribute('se-max-value')) || dayMaxOriginal;
                            daySlider.onChange(int, currentMax);
                        }
                    }
                });
            }

            // Обработчики для inputMax дней
            if (inputMax) {
                inputMax.addEventListener('input', function(e) {
                    e.target.value = e.target.value.replace(/[^\d]/g, '');
                });

                inputMax.addEventListener('blur', function(e) {
                    let int = parseFloat(e.target.value.replace(/[^\d]/g, ''));

                    if (isNaN(int)) {
                        int = dayMaxOriginal;
                    }

                    let minInputValue = inputMin ? parseFloat(inputMin.value.replace(/[^\d]/g, '')) : dayMinOriginal;
                    if (isNaN(minInputValue)) {
                        minInputValue = dayMinOriginal;
                    }

                    if (int < dayMinOriginal) {
                        int = dayMinOriginal;
                    }
                    if (int > dayMaxOriginal) {
                        int = dayMaxOriginal;
                    }
                    if (int < minInputValue) {
                        int = minInputValue;
                    }

                    e.target.value = delimiter(int);
                    if (daySlider) {
                        daySlider.setMaxValue(int);
                        if (typeof daySlider.onChange === 'function') {
                            const currentMin = parseFloat(daySlider.slider.getAttribute('se-min-value')) || dayMinOriginal;
                            daySlider.onChange(currentMin, int);
                        }
                    }
                });
            }

            console.log('Слайдер для дней инициализирован');

        } catch (error) {
            console.error('Ошибка инициализации слайдера для дней:', error);
        }
    }

    // ============================================
    // Инициализация слайдера для цен (существующий)
    // ============================================
    function initPriceRange() {
        try {
            if (typeof ZBRangeSlider === 'undefined') {
                console.warn('ZBRangeSlider не загружен');
                return;
            }

            const sliderContainer = document.getElementById('price-slider');
            if (!sliderContainer) {
                console.warn('Контейнер слайдера #price-slider не найден');
                return;
            }

            if (sliders.price) {
                return;
            }

            console.log('Создаем слайдер для цен...');
            const priceSlider = new ZBRangeSlider('price-slider');
            sliders.price = priceSlider;

            const inputMax = document.querySelector('[data-price-range="max"]');
            const inputMin = document.querySelector('[data-price-range="min"]');

            const priceMinOriginal = parseFloat(sliderContainer.getAttribute('se-min')) || 0;
            const priceMaxOriginal = parseFloat(sliderContainer.getAttribute('se-max')) || 10000;

            if (inputMax) inputMax.value = delimiter(priceMaxOriginal) + ' ₽';
            if (inputMin) inputMin.value = delimiter(priceMinOriginal) + ' ₽';

            priceSlider.onChange = function(min, max) {
                if (inputMax) inputMax.value = delimiter(max) + ' ₽';
                if (inputMin) inputMin.value = delimiter(min) + ' ₽';
                console.log('onChange цен', min, max);
            };

            // Обработчики для inputMin цен
            if (inputMin) {
                inputMin.addEventListener('input', function(e) {
                    e.target.value = e.target.value.replace(/[^\d]/g, '');
                });

                inputMin.addEventListener('blur', function(e) {
                    let int = parseFloat(e.target.value.replace(/[^\d]/g, ''));

                    if (isNaN(int)) {
                        int = priceMinOriginal;
                    }

                    let maxInputValue = inputMax ? parseFloat(inputMax.value.replace(/[^\d]/g, '')) : priceMaxOriginal;
                    if (isNaN(maxInputValue)) {
                        maxInputValue = priceMaxOriginal;
                    }

                    if (int < priceMinOriginal) {
                        int = priceMinOriginal;
                    }
                    if (int > priceMaxOriginal) {
                        int = priceMaxOriginal;
                    }
                    if (int > maxInputValue) {
                        int = maxInputValue;
                    }

                    e.target.value = delimiter(int) + ' ₽';
                    if (priceSlider) {
                        priceSlider.setMinValue(int);
                        if (typeof priceSlider.onChange === 'function') {
                            const currentMax = parseFloat(priceSlider.slider.getAttribute('se-max-value')) || priceMaxOriginal;
                            priceSlider.onChange(int, currentMax);
                        }
                    }
                });
            }

            // Обработчики для inputMax цен
            if (inputMax) {
                inputMax.addEventListener('input', function(e) {
                    e.target.value = e.target.value.replace(/[^\d]/g, '');
                });

                inputMax.addEventListener('blur', function(e) {
                    let int = parseFloat(e.target.value.replace(/[^\d]/g, ''));

                    if (isNaN(int)) {
                        int = priceMaxOriginal;
                    }

                    let minInputValue = inputMin ? parseFloat(inputMin.value.replace(/[^\d]/g, '')) : priceMinOriginal;
                    if (isNaN(minInputValue)) {
                        minInputValue = priceMinOriginal;
                    }

                    if (int < priceMinOriginal) {
                        int = priceMinOriginal;
                    }
                    if (int > priceMaxOriginal) {
                        int = priceMaxOriginal;
                    }
                    if (int < minInputValue) {
                        int = minInputValue;
                    }

                    e.target.value = delimiter(int) + ' ₽';
                    if (priceSlider) {
                        priceSlider.setMaxValue(int);
                        if (typeof priceSlider.onChange === 'function') {
                            const currentMin = parseFloat(priceSlider.slider.getAttribute('se-min-value')) || priceMinOriginal;
                            priceSlider.onChange(currentMin, int);
                        }
                    }
                });
            }

            console.log('Слайдер для цен инициализирован');

        } catch (error) {
            console.error('Ошибка инициализации слайдера для цен:', error);
        }
    }

    // ============================================
    // Функция сброса для слайдера дней
    // ============================================
    function resetDaySlider() {
        if (sliders.day) {
            const sliderContainer = document.getElementById('day-slider');
            const dayMinOriginal = parseFloat(sliderContainer.getAttribute('se-min')) || 1;
            const dayMaxOriginal = parseFloat(sliderContainer.getAttribute('se-max')) || 16;

            sliders.day.setMinValue(dayMinOriginal);
            sliders.day.setMaxValue(dayMaxOriginal);

            const minInput = document.querySelector('[data-day-range="min"]');
            const maxInput = document.querySelector('[data-day-range="max"]');

            if (minInput) minInput.value = delimiter(dayMinOriginal);
            if (maxInput) maxInput.value = delimiter(dayMaxOriginal);

            if (typeof sliders.day.onChange === 'function') {
                sliders.day.onChange(dayMinOriginal, dayMaxOriginal);
            }
        }
    }

    // ============================================
    // Функция сброса для слайдера цен
    // ============================================
    function resetPriceSlider() {
        if (sliders.price) {
            const sliderContainer = document.getElementById('price-slider');
            const priceMinOriginal = parseFloat(sliderContainer.getAttribute('se-min')) || 0;
            const priceMaxOriginal = parseFloat(sliderContainer.getAttribute('se-max')) || 10000;

            sliders.price.setMinValue(priceMinOriginal);
            sliders.price.setMaxValue(priceMaxOriginal);

            const minInput = document.querySelector('[data-price-range="min"]');
            const maxInput = document.querySelector('[data-price-range="max"]');

            if (minInput) minInput.value = delimiter(priceMinOriginal) + ' ₽';
            if (maxInput) maxInput.value = delimiter(priceMaxOriginal) + ' ₽';

            if (typeof sliders.price.onChange === 'function') {
                sliders.price.onChange(priceMinOriginal, priceMaxOriginal);
            }
        }
    }

    // ============================================
    // Функция сброса для чекбоксов
    // ============================================
    function resetCheckboxes() {
        // Очищаем все чекбоксы в .filter-properties__list
        document.querySelectorAll('.filter-properties__list input[type="checkbox"]').forEach(function(checkbox) {
            checkbox.checked = false;
            const changeEvent = new Event('change', { bubbles: true });
            checkbox.dispatchEvent(changeEvent);
        });

        // Очищаем чекбоксы в .category-filter__item (если есть)
        document.querySelectorAll('.category-filter__item input[type="checkbox"]').forEach(function(checkbox) {
            checkbox.checked = false;
            const changeEvent = new Event('change', { bubbles: true });
            checkbox.dispatchEvent(changeEvent);
        });

        // Сбрасываем активные кнопки
        document.querySelectorAll(".filter-products__button").forEach(function(btn) {
            btn.classList.remove("active");
        });

        // Сбрасываем активные состояния в .filter-properties__list
        document.querySelectorAll('.filter-properties__list .active').forEach(function(el) {
            el.classList.remove('active');
        });
    }

    // ============================================
    // Инициализация всех слайдеров
    // ============================================
    function initializeAllSliders() {
        setTimeout(() => {
            // Инициализируем слайдер для цен
            if (document.getElementById('price-slider')) {
                initPriceRange();
            }

            // Инициализируем слайдер для дней
            if (document.getElementById('day-slider')) {
                initDaySlider();
            }
        }, 200);
    }

    // Запускаем инициализацию
    initializeAllSliders();

    // ============================================
    // Обработчик открытия фильтра
    // ============================================
    const filterTrigger = document.querySelector('[data-target="filter"]');
    if (filterTrigger) {
        filterTrigger.addEventListener('click', function() {
            setTimeout(() => {
                if (document.getElementById('price-slider') && !sliders.price) {
                    initPriceRange();
                }
                if (document.getElementById('day-slider') && !sliders.day) {
                    initDaySlider();
                }
            }, 300);
        });
    }

    // ============================================
    // Обработчик ресайза
    // ============================================
    window.addEventListener('resize', function() {
        Object.keys(sliders).forEach(key => {
            const slider = sliders[key];
            if (slider && typeof slider.reset === 'function') {
                const sliderElement = slider.slider;
                const minValue = parseFloat(sliderElement.getAttribute('se-min-value'));
                const maxValue = parseFloat(sliderElement.getAttribute('se-max-value'));

                slider.reset();
                slider.setMinValue(minValue);
                slider.setMaxValue(maxValue);
            }
        });
    });

    // ============================================
    // Обработчик кнопки сброса
    // ============================================
    const clearButton = document.querySelector('[data-filter="clear"]');
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            // Очищаем чекбоксы
            document.querySelectorAll('.category-filter__item input[type="checkbox"]').forEach(function(checkbox) {
                checkbox.checked = false;
                const changeEvent = new Event('change', { bubbles: true });
                checkbox.dispatchEvent(changeEvent);
            });
            // Очищаем все чекбоксы
            resetCheckboxes();
            // Сбрасываем слайдеры
            resetPriceSlider();
            resetDaySlider();

            // Очищаем активные кнопки
            const buttons = document.querySelectorAll(".filter-products__button");
            buttons.forEach(function(btn) {
                btn.classList.remove("active");
            });

            // Отправляем форму
            const form = document.querySelector('.category-filter form');
            if (form) {
                const entity = form.dataset.filter;
                if (entity && window.Filter && window.Filter[entity]) {
                    window.Filter[entity].submit();
                } else {
                    form.submit();
                }
            }
        });
    }
});
