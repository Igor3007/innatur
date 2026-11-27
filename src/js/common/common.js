import { MaskInput } from "maska";
import {afLightbox} from "../vendor/af-lightbox.js";

document.addEventListener('DOMContentLoaded', function (event) {

    /* =================================================
    css variable
    =================================================*/

    function css_variable() {
        let vh = window.innerHeight * 0.01;
        let hgtheader = document.querySelector('header') ? document.querySelector('header').clientHeight : 64
        let hgtheadertop = document.querySelector('.header-top') ? document.querySelector('.header-top').clientHeight : 41
        let sphead = document.querySelector('.sp-head') ? document.querySelector('.sp-head').clientHeight : 41

        document.documentElement.style.setProperty('--vh', vh + 'px');
        document.documentElement.style.setProperty('--hgt-header', hgtheader + 'px');
        document.documentElement.style.setProperty('--hgt-header-top', hgtheadertop + 'px');
        document.documentElement.style.setProperty('--hgt-sp-head', sphead + 'px');

        return {
            vh,
            hgtheader,
            hgtheadertop,
            sphead
        }
    }

    window.addEventListener('load', css_variable);
    window.addEventListener('resize', css_variable);

    /* =================================================
    load ymaps api
    =================================================*/

    window.loadApiYmaps = function (callback) {

        if (window.ymaps == undefined && !window.stateLoadingApi) {
            window.stateLoadingApi = true
            const script = document.createElement('script')
            script.src = API_YMAPS
            script.onload = () => {
                callback(window.ymaps)
            }
            document.head.append(script)
        } else {
            callback(window.ymaps)
        }

    }

    /* =================================================
    smooth scroll
    ================================================= */

    // window.scrollToTargetAdjusted = function (params) {
    //
    //     let element = typeof params.elem == 'string' ? document.querySelector(params.elem) : params.elem
    //     let elementPosition = element.getBoundingClientRect().top + window.scrollY
    //
    //     let offsetPosition = elementPosition
    //     offsetPosition -= (params.offset ? params.offset : 0)
    //
    //     window.scrollTo({
    //         top: Number(offsetPosition),
    //         behavior: "smooth"
    //     });
    // }


    /* =================================================
    preloader
    ================================================= */

    class Preloader {

        constructor() {
            this.$el = this.init()
            this.state = false
        }

        init() {
            const el = document.createElement('div')
            el.classList.add('loading')
            el.innerHTML = '<div class="indeterminate"></div>';
            document.body.append(el)
            return el;
        }

        load() {

            this.state = true;

            setTimeout(() => {
                if (this.state) this.$el.classList.add('load')
            }, 300)
        }

        stop() {

            this.state = false;

            setTimeout(() => {
                if (this.$el.classList.contains('load'))
                    this.$el.classList.remove('load')
            }, 200)
        }

    }

    window.preloader = new Preloader();


    /* ==============================================
    Status
    ============================================== */

    function Status() {

        this.containerElem = '#status'
        this.headerElem = '#status_header'
        this.msgElem = '#status_msg'
        this.btnElem = '#status_btn'
        this.timeOut = 10000,
            this.autoHide = true

        this.init = function () {
            let elem = document.createElement('div')
            elem.setAttribute('id', 'status')
            elem.innerHTML = '<div id="status_header"></div> <div id="status_msg"></div><div id="status_btn"></div>'
            document.body.append(elem)

            document.querySelector(this.btnElem).addEventListener('click', function () {
                this.parentNode.setAttribute('class', '')
            })
        }

        this.msg = function (_msg, _header) {
            _header = (_header ? _header : 'Отлично!')
            this.onShow('complete', _header, _msg)
            if (this.autoHide) {
                this.onHide();
            }
        }
        this.err = function (_msg, _header) {
            _header = (_header ? _header : 'Ошибка')
            this.onShow('error', _header, _msg)
            if (this.autoHide) {
                this.onHide();
            }
        }
        this.wrn = function (_msg, _header) {
            _header = (_header ? _header : 'Внимание')
            this.onShow('warning', _header, _msg)
            if (this.autoHide) {
                this.onHide();
            }
        }

        this.onShow = function (_type, _header, _msg) {
            document.querySelector(this.headerElem).innerText = _header
            document.querySelector(this.msgElem).innerText = _msg
            document.querySelector(this.containerElem).classList.add(_type)
        }

        this.onHide = function () {
            setTimeout(() => {
                document.querySelector(this.containerElem).setAttribute('class', '')
            }, this.timeOut);
        }

    }

    window.STATUS = new Status();
    const STATUS = window.STATUS;
    STATUS.init();

    /* ==============================================
    ajax request
    ============================================== */

    window.ajax = function (params, response) {

        //params Object
        //dom element
        //collback function

        window.preloader.load()

        let xhr = new XMLHttpRequest();
        xhr.open((params.type ? params.type : 'POST'), params.url)

        if (params.headers) {
            for (let key in params.headers) {
                xhr.setRequestHeader(key, params.headers[key]);
            }
        }

        if (params.responseType == 'json') {
            xhr.responseType = 'json';
            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            xhr.send(JSON.stringify(params.data))
        } else {
            let formData = new FormData()
            for (key in params.data) {
                formData.append(key, params.data[key])
            }
            xhr.send(formData)
        }

        xhr.onload = function () {

            response ? response(xhr.status, xhr.response) : ''
            window.preloader.stop()
            setTimeout(function () {
                if (params.btn) {
                    params.btn.classList.remove('btn-loading')
                }
            }, 300)
        };

        xhr.onerror = function () {
            window.STATUS.err('Error: ajax request failed')
        };

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 3) {
                if (params.btn) {
                    params.btn.classList.add('btn-loading')
                }
            }
        };
    }

    /* ==================================================
    maska
    ==================================================*/

    function initMaska() {
        new MaskInput("[data-maska]");

        new MaskInput("[data-input-mask='name']", {
            mask: 'A',
            tokens: {
                A: {
                    pattern: /[a-zA-ZА-Яа-я ]/,
                    repeated: true
                },
            }
        });

    }

    initMaska();


    /* ==================================================
    burgerMenu
    ==================================================*/

    class MainMenu {
        constructor(ctx) {
            this.$el = ctx
            this.btns = this.$el.querySelectorAll('[data-menu="open"]')
            this.container = this.$el.querySelector('[data-menu="container"]')

            this.addEvent()
            this.afterLoad()
        }

        toggleMenu(item) {
            item.classList.toggle('is-open')

            if (!item.classList.contains('is-open')) {
                this.closeMenu()
            } else {
                this.openMenu()
            }
        }

        openMenu() {
            this.container.classList.toggle('is-open')
            this.$el.body.classList.toggle('page-hidden')
            this.$el.body.classList.toggle('open-modile-menu')

        }

        closeMenu() {
            this.btns.forEach(item => {
                !item.classList.contains('is-open') || item.classList.remove('is-open')
            });

            !this.$el.body.classList.contains('open-modile-menu') || !this.$el.body.classList.remove('open-modile-menu');
            !this.container.classList.contains('is-open') || this.container.classList.remove('is-open');
            !this.$el.body.classList.contains('page-hidden') || this.$el.body.classList.remove('page-hidden');
        }


        afterLoad() {
            this.container.querySelectorAll('.isset-sub').forEach(item => {
                item.addEventListener('click', e => {
                    e.stopPropagation()


                    if (e.target.classList.contains('is-open')) {
                        e.target.classList.remove('is-open')
                        return false;
                    }

                    e.target.closest('ul').querySelectorAll('.is-open').forEach(li => {
                        li.classList.remove('is-open')
                    })

                    e.target.classList.toggle('is-open')
                })
            })
        }

        addEvent() {
            this.btns.forEach(item => {
                item.addEventListener('click', e => this.toggleMenu(item))
            })

            this.$el.querySelectorAll('[data-menu="close"]').forEach(item => {
                item.addEventListener('click', () => {
                    this.closeMenu()
                })
            })
        }
    }

    if (document.querySelector('[data-menu="open"]')) {
        window.MainMenu = new MainMenu(document)
    }
    /* =================================================
        popups
        =================================================*/

    function popupSuccess() {

        const instansePopup = new afLightbox({
            mobileInBottom: true
        })

        instansePopup.open(`

           <div class="popup-thanks" >

           <h2> Спасибо! </h2>
           <p>Мы свяжемся с вами в ближайшее время!</p>

           </div>

            `, false)

    }

    if (document.querySelector('[data-modal]')) {
        const items = document.querySelectorAll('[data-modal]')

        items.forEach(item => {
            item.addEventListener('click', e => {

                window.ajax({
                    type: 'GET',
                    url: item.dataset.modal
                }, (status, response) => {

                    const instansePopup = new afLightbox({
                        mobileInBottom: true
                    })

                    instansePopup.open(response, (instanse) => {
                        initMaska()

                        if (instanse.querySelector('form')) {
                            const form = instanse.querySelector('form')

                            form.addEventListener('submit', e => {

                                e.preventDefault()

                                const formData = new FormData(e.target)
                                let params = {}
                                let btn = form.querySelector('.btn')

                                for (let [name, value] of formData) {
                                    params[name] = value
                                }

                                btn.classList.add('btn-loading')

                                window.ajax({
                                    type: 'POST',
                                    url: form.getAttribute('action'),
                                    data: params

                                }, (status, response) => {

                                    if (status == 200) {
                                        popupSuccess();
                                        !btn.classList.contains('btn-loading') || btn.classList.remove('btn-loading')
                                        instansePopup.close()
                                    }


                                })
                            })
                        }

                        if (item.dataset.title) {
                            instanse.querySelector('.popup-form__title').innerHTML = item.dataset.title
                        }

                        if (item.dataset.desc) {
                            instanse.querySelector('.popup-form__desc').innerHTML = item.dataset.desc
                        }
                    })
                })

            })
        })
    }



}); //dcl




document.addEventListener('DOMContentLoaded', function() {
    const heads = document.querySelectorAll('.footer-category__head');

    heads.forEach(function(head) {
        head.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.closest('.footer-category');
            if (category) {
                category.classList.toggle('open');
            }
        });
    });
});

// Вариант 3: Компактный и чистый
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('[data-tab]');
    const contents = document.querySelectorAll('[data-content]');

    function showTab(index) {
        tabs.forEach(tab => {
            tab.classList.toggle('active', parseInt(tab.dataset.tab) === index);
        });

        contents.forEach(content => {
            const isActive = parseInt(content.dataset.content) === index;
            content.classList.toggle('active', isActive);
            content.style.display = isActive ? 'block' : 'none';
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            if (this.tagName === 'A') e.preventDefault();
            showTab(parseInt(this.dataset.tab));
        });
    });

    // Показываем активный или первый
    const activeTab = document.querySelector('[data-tab].active');
    showTab(activeTab ? parseInt(activeTab.dataset.tab) : 0);


});

function initCommentButtons() {
    document.querySelectorAll('.aboutSlider__item_comment-text').forEach(textElement => {
        const comment = textElement.closest('.aboutSlider__item_comment');
        const btn = comment?.querySelector('.aboutSlider__item_comment-btn');

        if (!btn) return;

        function toggleButton() {
            const isOverflowing = textElement.scrollHeight > textElement.clientHeight;
            btn.classList.toggle('visible', isOverflowing);
        }

        // Задержка для полной загрузки контента
        const checkWithDelay = () => {
            setTimeout(toggleButton, 200);
        };

        // Проверяем сразу
        checkWithDelay();

        // Проверяем после загрузки всех ресурсов
        window.addEventListener('load', checkWithDelay);

        // Проверяем при изменении размера
        window.addEventListener('resize', toggleButton);

        // Используем ResizeObserver если доступен
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
                toggleButton();
            });
            resizeObserver.observe(textElement);
        }

        // Проверяем при прокрутке (на случай, если элементы появляются с задержкой)
        document.addEventListener('scroll', () => {
            const rect = textElement.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                toggleButton();
            }
        }, { once: true });
    });
}


document.addEventListener('DOMContentLoaded', function () {
    const nav = document.querySelector('.toursContentInfoTop ul');
    if (!nav) return;

    const links = Array.from(nav.querySelectorAll('a[href^="#"]'));

    // Оставляем только ссылки с реальными якорями (не href="#")
    const items = links
        .map(link => {
            const hash = link.getAttribute('href');
            if (hash === '#') return null;
            const target = document.querySelector(hash);
            if (!target) return null;
            return { link, target, hash };
        })
        .filter(Boolean);

    if (!items.length) return;

    // ===== 1. Клик по пункту меню =====
    items.forEach(({ link, target }) => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            // Снимаем active со всех, ставим на текущий
            items.forEach(i => i.link.classList.remove('active'));
            link.classList.add('active');

            // Плавный скролл к блоку с учётом высоты фиксированного меню
            const offset = nav.closest('.toursContentInfoTop')?.offsetHeight || 0;
            const top = target.getBoundingClientRect().top + window.scrollY - offset - 10;

            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    // ===== 2. Смена active при прокрутке =====
    function updateActiveOnScroll() {
        const offset = nav.closest('.toursContentInfoTop')?.offsetHeight || 0;
        const scrollPos = window.scrollY + offset + 20;

        // Ищем последний блок, который уже начался выше текущей позиции
        let current = items[0];

        items.forEach(item => {
            if (item.target.offsetTop <= scrollPos) {
                current = item;
            }
        });

        // Если доскроллили до конца страницы — подсветить последний
        if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 5) {
            current = items[items.length - 1];
        }

        items.forEach(item => {
            item.link.classList.toggle('active', item === current);
        });
    }

    // Троттлинг через requestAnimationFrame — чтобы не дёргать при каждом пикселе
    let ticking = false;
    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                updateActiveOnScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Первичный расчёт
    updateActiveOnScroll();
});

// Запускаем после DOM готов
document.addEventListener('DOMContentLoaded', initCommentButtons);
// И после полной загрузки
window.addEventListener('load', initCommentButtons);

