document.addEventListener('DOMContentLoaded', function () {
    const wrapMap = document.getElementById('wrapMap');
    if (!wrapMap) return;

    const MOBILE_BREAKPOINT = 767;
    const iframe = wrapMap.querySelector('iframe');
    if (!iframe) return;

    let mapTitle = null;
    let isActivated = false;

    function createTitle() {
        if (mapTitle) return;
        mapTitle = document.createElement('div');
        mapTitle.className = 'mapTitle';

        const mapTitleText = document.createElement('span');
        mapTitleText.textContent = 'Воспользоваться картой';
        mapTitle.appendChild(mapTitleText);

        wrapMap.appendChild(mapTitle);
    }

    function removeTitle() {
        if (mapTitle) {
            mapTitle.remove();
            mapTitle = null;
        }
    }

    function lockMap() {
        iframe.style.pointerEvents = 'none';
    }

    function unlockMap() {
        iframe.style.pointerEvents = '';
    }

    function applyState() {
        if (window.innerWidth < MOBILE_BREAKPOINT) {
            // Мобильный режим
            if (!isActivated) {
                lockMap();
                createTitle();
            } else {
                unlockMap();
                removeTitle();
            }
        } else {
            // Десктоп — карта всегда активна, подсказки нет
            unlockMap();
            removeTitle();
        }
    }

    // Клик по обёртке — активируем карту (только на мобилке)
    wrapMap.addEventListener('click', function () {
        if (window.innerWidth >= MOBILE_BREAKPOINT) return;
        if (isActivated) return;

        isActivated = true;
        unlockMap();
        removeTitle();
    });

    // Пересчёт при изменении размера окна
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(applyState, 150);
    });

    applyState();
});
