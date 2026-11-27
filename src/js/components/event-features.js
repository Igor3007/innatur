/**
 * Переключение «Преимущества участия».
 * Одна панель контента:
 *   - desktop (>= lg): справа от списка, position: sticky
 *   - mobile (< lg): под списком
 * Триггер: клик (везде) + mouseenter (только desktop).
 */
export default function initEventFeatures() {
    const root = document.querySelector('[data-features]');
    if (!root) return;

    const cards = root.querySelectorAll('[data-feature-id]');
    if (!cards.length) return;

    const isDesktop = () => window.matchMedia('(min-width: 992px)').matches;

    function activate(id) {
        cards.forEach((c) => {
            c.classList.toggle('active', c.dataset.featureId === id);
        });

        const panels = root.querySelectorAll('[data-feature-panel]');
        panels.forEach((p) => {
            p.classList.toggle('active', p.dataset.featurePanel === id);
        });
    }

    cards.forEach((card) => {
        const id = card.dataset.featureId;

        card.addEventListener('click', () => activate(id));

        card.addEventListener('mouseenter', () => {
            if (isDesktop()) activate(id);
        });
    });
}
