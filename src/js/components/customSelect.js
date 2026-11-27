class SortSelector {
    constructor(container) {
        this.container = container;
        this.sortSelect = container.querySelector('.contentSort__select');
        this.sortList = this.sortSelect.querySelector('ul');
        this.listItems = this.sortList.querySelectorAll('li');

        this.customTrigger = null;
        this.isMobile = window.innerWidth <= 1025;
        this.isOpen = false;

        this.init();
    }

    init() {
        this.createCustomSelect();
        this.bindEvents();
    }

    setActiveItem(value, text) {
        this.listItems.forEach(item => {
            const isActive = item.dataset.value === value;
            item.classList.toggle('active', isActive);
        });

        if (this.customTrigger) {
            this.customTrigger.textContent = text;
        }
    }

    createCustomSelect() {
        if (this.customTrigger) return;

        const activeItem = Array.from(this.listItems).find(item => item.classList.contains('active'));
        const activeText = activeItem ? activeItem.textContent : 'По популярности';

        this.customTrigger = document.createElement('div');
        this.customTrigger.className = 'custom-select-trigger';
        this.customTrigger.textContent = activeText;

        this.sortSelect.insertBefore(this.customTrigger, this.sortList);

        this.customTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.toggleSelect();
        });
    }

    toggleSelect() {
        // Закрываем календарь
        this.closeCalendar();

        // Закрываем все другие селекты
        document.querySelectorAll('.custom-select-trigger.active').forEach(trigger => {
            if (trigger !== this.customTrigger) {
                trigger.classList.remove('active');
                const list = trigger.parentElement.querySelector('ul');
                if (list) list.classList.remove('show');
            }
        });

        this.customTrigger.classList.toggle('active');
        this.isOpen = this.customTrigger.classList.contains('active');

        if (this.isOpen) {
            this.sortList.classList.add('show');
        } else {
            this.sortList.classList.remove('show');
        }
    }

    closeCalendar() {
        const calendarContainer = document.querySelector('.calendar-container');
        if (calendarContainer) {
            calendarContainer.style.display = 'none';
        }
    }

    closeDropdown() {
        if (this.customTrigger) {
            this.customTrigger.classList.remove('active');
            this.sortList.classList.remove('show');
            this.isOpen = false;
        }
    }

    bindEvents() {
        this.listItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();

                const value = item.dataset.value;
                const text = item.textContent;

                this.setActiveItem(value, text);

                if (this.customTrigger) {
                    this.customTrigger.classList.remove('active');
                    this.sortList.classList.remove('show');
                    this.customTrigger.textContent = text;
                    this.isOpen = false;
                }
            });
        });
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function () {
    window.sortSelectors = window.sortSelectors || [];

    function initSortSelectors(root) {
        root.querySelectorAll('.contentSort').forEach(container => {
            // Защита от повторной инициализации одного и того же контейнера
            if (container.dataset.sortInit === 'true') return;
            container.dataset.sortInit = 'true';

            try {
                const selector = new SortSelector(container);
                window.sortSelectors.push(selector);
            } catch (error) {
                console.error('Ошибка инициализации сортировки', error);
            }
        });
    }

    // Инициализация при загрузке страницы
    initSortSelectors(document);

    // Инициализация при появлении новых .contentSort (модалки, динамика)
    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== 1) continue;

                if (node.matches && node.matches('.contentSort')) {
                    initSortSelectors(node.parentElement || document);
                } else if (node.querySelectorAll) {
                    const found = node.querySelectorAll('.contentSort');
                    if (found.length) initSortSelectors(node);
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
});
