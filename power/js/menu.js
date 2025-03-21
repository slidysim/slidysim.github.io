import("https://kit.fontawesome.com/9fa2f75402.js"); /* font awesome icons */

const menuBtn = document.querySelector(".menu-btn");
const menu = document.querySelector(".menu");
const menuIcon = document.querySelector(".menu-icon");

const menuToggle = () => {
    menu.classList.toggle("menu-active");
    menuIcon.classList.toggle("menu-icon-open");
    document.body.classList.toggle("overflow-hidden");
};

// Click outside menu to close
document.addEventListener("click", (e) => {
    if (menu.classList.contains("menu-active")) {
        menuToggle();
    }
});

// Prevent closing when clicking menu button
menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menuToggle();
});

// Prevent closing when clicking inside menu
menu.addEventListener("click", (e) => {
    e.stopPropagation();
});