import Swiper, { Navigation, Pagination } from 'swiper';

Swiper.use([Pagination, Navigation]);

(() => {
  const $slider = document.getElementById('slider')
  if (!$slider) return

  new Swiper('#slider', {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 10,
    breakpoints: {
      600: {
        spaceBetween: 20,
        slidesPerView: 2,
      },
      1280: {
        spaceBetween: 40,
        slidesPerView: 4,
      },
      2188: {
        spaceBetween: 129,
        slidesPerView: 4,
      },
    },

    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true,
      bulletElement: 'button',
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });
})()
