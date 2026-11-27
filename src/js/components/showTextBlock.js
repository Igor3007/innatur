document.addEventListener('DOMContentLoaded', function () {
    const LIMIT = 600;
    const BREAKPOINT = 766;
    const TEXT_SELECTOR = '.textHideMobile';

    function initTextHide() {
        document.querySelectorAll(TEXT_SELECTOR).forEach(block => {
            if (block.dataset.textHideInit === 'true') return;
            block.dataset.textHideInit = 'true';

            const originalHTML = block.innerHTML;
            const plainText = block.textContent.replace(/\s+/g, ' ').trim();

            if (plainText.length <= LIMIT) return;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'textHideMobile__toggle';
            btn.textContent = 'Читать далее';

            let expanded = false;

            function truncate() {
                block.innerHTML = truncateBySentences(originalHTML, LIMIT);
            }

            function expand() {
                block.innerHTML = originalHTML;
            }

            function applyState() {
                if (window.innerWidth < BREAKPOINT) {
                    if (!expanded) {
                        truncate();
                        btn.textContent = 'Читать далее';
                        block.classList.remove('open');
                        btn.classList.remove('open');
                    } else {
                        expand();
                        btn.textContent = 'Свернуть';
                        block.classList.add('open');
                        btn.classList.add('open');
                    }
                    if (!btn.parentElement) block.after(btn);
                    btn.style.display = '';
                } else {
                    expand();
                    btn.style.display = 'none';
                    block.classList.remove('open');
                    btn.classList.remove('open');
                }
            }

            btn.addEventListener('click', function () {
                expanded = !expanded;
                applyState();
            });

            let resizeTimer;
            window.addEventListener('resize', function () {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    if (window.innerWidth >= BREAKPOINT) expanded = false;
                    applyState();
                }, 150);
            });

            applyState();
        });
    }

    /**
     * Обрезает HTML по последнему полному предложению в пределах лимита.
     * Троеточие добавляется ВНУТРЬ того же <p>, где закончилось предложение.
     */
    function truncateBySentences(html, limit) {
        const temp = document.createElement('div');
        temp.innerHTML = html;

        let count = 0;      // сколько символов уже набрали
        let truncated = false;

        // Обходим <p> (или прямые дети контейнера) по порядку
        const blocks = Array.from(temp.children);

        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            const text = block.textContent;

            // Если блок целиком влезает — оставляем и идём дальше
            if (count + text.length <= limit) {
                count += text.length;
                continue;
            }

            // Блок не влезает — режем его по предложениям
            const remaining = limit - count;
            const cutIndex = findLastSentenceEnd(text, remaining);

            if (cutIndex === -1) {
                // В этом блоке нет ни одного полного предложения — удаляем его
                block.remove();
            } else {
                const kept = text.slice(0, cutIndex).trim();
                // Сохраняем только вложенные теги, если они есть (<b> внутри <p>)
                block.innerHTML = kept + '...';
            }

            // Удаляем все последующие блоки
            for (let j = i + 1; j < blocks.length; j++) {
                blocks[j].remove();
            }

            truncated = true;
            break;
        }

        return temp.innerHTML;
    }

    /**
     * Ищет позицию конца последнего предложения, укладывающегося в limit.
     * Возвращает индекс СРАЗУ ПОСЛЕ знака конца предложения или -1.
     */
    function findLastSentenceEnd(text, limit) {
        const sliced = text.slice(0, limit);
        // Ищем последний . ! ? … (с учётом возможных кавычек/скобок после)
        const regex = /[.!?…](?=\s|$)/g;
        let lastIndex = -1;
        let match;
        while ((match = regex.exec(sliced)) !== null) {
            lastIndex = match.index + match[0].length;
        }
        return lastIndex;
    }

    initTextHide();
});
