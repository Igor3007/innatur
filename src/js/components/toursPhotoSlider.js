import Splide from "@splidejs/splide";

export function toursPhotoSlider() {
    document
        .querySelectorAll('[data-slider="toursSlider"]')
        .forEach(slider => {
            if (slider['Splide']) {
                return;
            }

            slider['Splide'] = new Splide(slider, {
                perPage: 1,
                perMove: 1,
                omitEnd: true,
                gap: 16,
                pagination: true,
                arrows: false,
                breakpoints: {
                    555: {  height: 282 }
                },
            });

            slider['Splide'].mount();
        });
}
