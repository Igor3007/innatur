
import Splide from "@splidejs/splide";
import {getTopArrowButtons} from "./splide_ext.js";

export function otherSlider() {
    document
        .querySelectorAll('[data-slider="otherSlider"]')
        .forEach(slider => {
            if (slider['Splide']) {
                return;
            }

            slider['Splide'] = new Splide(slider, {
                // fixedWidth: 412,
                // perMove: 1,
                perPage: 3,
                perMove: 1,
                omitEnd: true,
                gap: 16,
                pagination: false,
                breakpoints: {
                    1440: { gap: 24 },
                    1024: { gap: 16 },
                    768: {
                        destroy: true
                    }
                },
                arrowPath: 'M16.204 12.396a1 1 0 011.4-.192l5.618 4.267a4.391 4.391 0 010 7.058l-5.617 4.267a1 1 0 11-1.21-1.592l5.617-4.268c1.317-1 1.317-2.872 0-3.872l-5.616-4.268a1 1 0 01-.192-1.4z'
            });

            slider['Splide'].on('mounted', (e) => {
                getTopArrowButtons(slider['Splide'].root);
            });

            slider['Splide'].on('resize', (e) => {
                getTopArrowButtons(slider['Splide'].root);
            });

            slider['Splide'].mount();
        });
}


document.addEventListener('DOMContentLoaded', function () {
    const BREAKPOINT = 766;
    const MAX_VISIBLE = 4;
    const LIST_SELECTOR = '.otherSlider .splide__list';

    function initShowMore() {
        document.querySelectorAll(LIST_SELECTOR).forEach(list => {
            if (list.dataset.showMoreInit === 'true') return;
            list.dataset.showMoreInit = 'true';

            const slides = Array.from(list.querySelectorAll('.splide__slide'));

            // Кнопка нужна только если слайдов больше 4
            if (slides.length <= MAX_VISIBLE) return;

            // Создаём кнопку
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn__white';
            btn.textContent = 'Показать ещё';

            // Куда вставлять — после списка (или после его контейнера)
            const insertAfter = list.closest('.splide') || list;
            insertAfter.after(btn);

            let expanded = false;

            function applyState() {
                if (window.innerWidth < BREAKPOINT) {
                    // Мобильный режим
                    slides.forEach((slide, i) => {
                        if (i < MAX_VISIBLE || expanded) {
                            slide.style.display = '';
                            slide.removeAttribute('hidden');
                        } else {
                            slide.style.display = 'none';
                            slide.setAttribute('hidden', '');
                        }
                    });

                    btn.style.display = '';
                    btn.textContent = expanded ? 'Свернуть' : 'Показать ещё';
                } else {
                    // Десктоп — показываем все, кнопку прячем
                    slides.forEach(slide => {
                        slide.style.display = '';
                        slide.removeAttribute('hidden');
                    });
                    btn.style.display = 'none';
                    expanded = false;
                }

                // Сбрасываем состояние Splide, чтобы он пересчитал раскладку
                if (window.splideInstances) {
                    // если храните инстансы вручную
                }
                if (insertAfter && insertAfter.splide) {
                    insertAfter.splide.refresh();
                }
            }

            btn.addEventListener('click', function () {
                expanded = !expanded;
                applyState();
            });

            let resizeTimer;
            window.addEventListener('resize', function () {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(applyState, 150);
            });

            applyState();
        });
    }

    initShowMore();
});
