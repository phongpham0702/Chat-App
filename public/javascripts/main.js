
// Initialize the Swiper carousel
const mySwiper = new Swiper('.swiper-container', {
  slidesPerView: 1,
  spaceBetween: 1,
  speed: 500,
  loop: true,
  // If we need pagination
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },

  // Navigation arrows
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
});

// Get all the picture elements
let pictures = document.querySelectorAll('.picture img');
// Get demo avatar element
const demoAvatar = document.querySelector(".form-container .form-group .demoAvatar img")
// Add click event listeners to each picture element
pictures.forEach(function (picture) {
  picture.addEventListener('click', function () {
    // Get the corresponding radio button
    let radio = picture.parentElement.querySelector('input[type="radio"]').checked = true;
    demoAvatar.src = picture.src

  });
});



