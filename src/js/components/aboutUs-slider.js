
import Splide from "@splidejs/splide";
import {getTopArrowButtons} from "./splide_ext.js";

export function aboutUsSlider() {
    document
        .querySelectorAll('[data-slider="aboutUs"]')
        .forEach(slider => {
            if (slider['Splide']) {
                return;
            }

            slider['Splide'] = new Splide(slider, {
                // fixedWidth: 412,
                // perMove: 1,
                perPage: 2,
                perMove: 1,
                omitEnd: true,
                gap: 16,
                pagination: false,
                breakpoints: {
                    1440: { gap: 24 },
                    1024: { gap: 16 },
                    768: {
                        arrows: false,
                        perPage: 1,
                        pagination: true,
                        fixedWidth: 300,
                        focus: 'center',
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
