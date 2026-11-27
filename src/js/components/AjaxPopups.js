import { afLightbox } from "../vendor/af-lightbox.js";
import { config } from "../config.js";
import { onLoadCallback } from "./popupHelpers.js";

/**
 * Инициализация попапов, загружаемых через AJAX
 */
export function initAjaxPopups() {
    /**
        data-popup - общий селектор для попапов
        data-src - ссылка для получения хтмл шаблона
        data-*** - можно добавить любой дата атрибут и он отправится на сервак. наприм. (data-id=1)

        exceptions - какие атрибуты исклюить из отправки
        после згрузки вызываются функции хелперы для работы
    */

    const exceptions = ["popup", "src"];

    document.querySelectorAll("[data-popup=ajax]").forEach((item) => {
        if (item.classList.contains("is-loading")) {
            return;
        }
        item.classList.add("is-loading");
        item.addEventListener("click", () => {
            const ajax_url = config.AJAX_POPUP_PATH.replace("{src}", item.dataset.src);
            const url = new URL(window.location.origin + ajax_url);

            for (let key in item.dataset) {
                if (!exceptions.includes(key)) {
                    url.searchParams.append(key, item.dataset[key]);
                }
            }

            const popup = new afLightbox({
                mobileInBottom: true,
                clases: item.dataset.type === "right" ? "af-position-right" : "",
            });

            popup.open('<span class="af-spiner"></span>', () => {
                fetch(url)
                    .then((response) => response.text())
                    .then((data) => {
                        popup.changeContent(data);

                        switch (item.dataset.src) {
                            case "popup_callback":
                            case "popup_question":
                            case "popup_order":
                            case "popup_consult":
                            case "popup_order-product":
                                onLoadCallback(popup);
                                break;

                        }

                        setTimeout(() => {
                            if (typeof window.initMaska === "function") {
                                window.initMaska();
                            }
                        }, 100);
                    })
                    .catch((err) => {
                        console.error("Ошибка загрузки html:", err);
                        window.STATUS?.err("Не удалось загрузить форму");
                    });
            });
        });
    });
}
