
import "./components/showTextBlock.js";
import "./components/formCounts.js";
import "./components/customSelect.js";
import "./components/navigationMenu.js";
import "./components/rangeSlider.js";
import "./components/contentNavigation";
import "./components/toursItemNavigation";
import "./components/sectionCategoryInfo";
import "./components/toursContentInfoMap";
import "./components/header";
import "./components/messenger";

import "./vendor/fslightbox.min";
import "./vendor/vanilla-calendar.min.js";
import "./vendor/af-lightbox";
import { storiesSlider } from "./components/stories-slider.js";
import { aboutCompany } from "./components/aboutCompany.js";
import { faq } from "./components/faq.js";
import { offersSlider } from "./components/offers-slider.js";
import { aboutUsSlider } from "./components/aboutUs-slider";
import {initProductGallery} from "./components/productGallery.js";

import "./common/common.js";
import {toursPhotoSlider} from "./components/toursPhotoSlider.js";
import {toursSliderFAQ} from "./components/toursSliderFAQ.js";
import {otherSlider} from "./components/other-slider.js";
import initLoadMoreEvents from "./components/load-more-events.js";
import initEventFeatures from "./components/event-features.js";
import { initAjaxPopups } from "./components/AjaxPopups.js";


document.addEventListener('DOMContentLoaded', function (event) {


    /* ==================================
    stories slider
    ==================================*/
    storiesSlider()

    /*============aboutCompany======================*/
    aboutCompany()

    /* ==================================
    stories slider
    ==================================*/
    offersSlider()
    /* ==================================
    thumbSlider
    ==================================*/
    initProductGallery()
    /* ==================================
    stories slider
    ==================================*/
    aboutUsSlider()
    /* ==================================*/
    toursPhotoSlider()
    /* ==================================*/
    toursSliderFAQ()
    /* ==================================*/
    otherSlider()
    /* ==================================
   FAQ()
    ==================================*/
    faq()
    /* ==================================
    показать больше для событий
    ==================================*/
    initLoadMoreEvents();
    /* ==================================
    переключатель для деталки событий
    ==================================*/
    initEventFeatures();
    /* ==================================
    модалки
    ==================================*/
    initAjaxPopups();


});
