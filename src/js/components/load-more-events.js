/**
 * AJAX-подгрузка карточек событий (HTML-фрагмент).
 *
 * Разметка:
 *   .events-page__grid[data-events-grid]
 *   button.btn__all[data-load-more][data-endpoint][data-page="1"][data-per-page="10"]
 *
 * Ответ сервера: HTML-фрагмент с карточками <a class="event-card">...</a>
 * Если карточек больше нет — сервер отдаёт пустую строку,
 * и кнопка скрывается.
 */
export default function initLoadMoreEvents() {
    const btn = document.querySelector('[data-load-more]');
    if (!btn) return;

    const grid = document.querySelector('[data-events-grid]');
    if (!grid) return;

    const endpoint = btn.dataset.endpoint || '/action.php';
    const perPage = parseInt(btn.dataset.perPage, 10) || 10;

    let page = parseInt(btn.dataset.page, 10) || 1;
    let loading = false;
    let ended = false;

    const loaderHtml = '<span class="btn__loader"></span>';

    async function loadNext() {
        if (loading || ended) return;

        loading = true;
        btn.classList.add('loading');
        btn.disabled = true;

        const originalHtml = btn.innerHTML;
        btn.innerHTML = loaderHtml;

        try {
            const nextPage = page + 1;

            const url = new URL(endpoint, window.location.origin);
            url.searchParams.set('action', 'load-events');
            url.searchParams.set('page', nextPage);
            url.searchParams.set('per_page', perPage);

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });

            if (!response.ok) throw new Error('Network error: ' + response.status);

            const html = (await response.text()).trim();

            if (!html) {
                ended = true;
                btn.closest('.events-page__more')?.remove();
                return;
            }

            // Вставляем фрагмент
            grid.insertAdjacentHTML('beforeend', html);

            // Обновляем state
            page = nextPage;
            btn.dataset.page = String(page);

            // Если пришло меньше perPage — считаем, что это конец
            const added = grid.querySelectorAll('.event-card').length;
            // (можно убрать, если сервер всегда отдаёт полную страницу и пустую строку в конце)
            if (added > 0 && html.split('event-card').length - 1 < perPage) {
                ended = true;
                btn.closest('.events-page__more')?.remove();
            }
        } catch (err) {
            console.error('[load-more-events]', err);
            btn.innerHTML = originalHtml;
        } finally {
            loading = false;
            btn.classList.remove('loading');
            btn.innerHTML = originalHtml;
            if (!ended) btn.disabled = false;

        }
    }

    btn.addEventListener('click', loadNext);
}
