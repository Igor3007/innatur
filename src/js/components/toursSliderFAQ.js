import Splide from "@splidejs/splide";

export function toursSliderFAQ() {
    document
        .querySelectorAll('[data-slider="toursSliderFAQ"]')
        .forEach(slider => {
            if (slider['Splide']) {
                return;
            }

            slider['Splide'] = new Splide(slider, {
                fixedWidth: 272,
                perMove: 1,
                omitEnd: true,
                gap: 0,
                focus: 0,
                pagination: false,
                arrows: false,
                breakpoints: {
                    767: {  fixedWidth: 108, }
                },
            });

            slider['Splide'].mount();
        });
}
