// THIS IS THE RANGE SLIDER LOGIC DO NOT CHANGE !!
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

    self.setMaxValue = function (maxValue) {
        // Проверка границ
        if (maxValue > max) maxValue = max;
        var currentMin = parseFloat(slider.getAttribute('se-min-value')) || min;
        if (maxValue < currentMin) maxValue = currentMin;

        // Расчет позиции правого ползунка
        var ratio = (maxValue - min) / (max - min);
        var maxPosition = slider.offsetWidth - touchRight.offsetWidth;
        var position = Math.round(ratio * maxPosition);

        touchRight.style.left = position + 'px';

        var leftPosition = parseFloat(touchLeft.style.left) || 0;
        lineSpan.style.marginLeft = leftPosition + 'px';
        lineSpan.style.width = (position - leftPosition) + 'px';

        slider.setAttribute('se-max-value', maxValue);
    }

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