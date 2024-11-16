// sounds are definitely needed..

function playSound(soundId) {
    const sound = document.getElementById(soundId);
    sound.volume = .1; // set volume (0 to 1) - 1 is "fun".
    sound.play();
}

document.addEventListener("DOMContentLoaded", function () {

    console.log("DOM is ready - hello main.js");
    document.body.classList.remove("load");

    checkNavigation();

    function checkNavigation() {
        try {
            const navBar = document.querySelector('.nav-bar');
            const closeBtn = document.querySelector('.close-btn');
            const showNav = document.querySelector('.show-nav');

            // might rework this to separate mobile nav
            closeBtn.addEventListener('click', () => {
                navBar.classList.add('hidden');
                showNav.classList.add('visible');
            });

            showNav.addEventListener('click', () => {
                navBar.classList.remove('hidden');
                showNav.classList.remove('visible');
            });

            const sectionRoles = document.getElementById('section-roles');
            let hasOpenedOnce = false;

            function handleScroll() {
                if (!hasOpenedOnce && sectionRoles != null ) {
                    const rect = sectionRoles.getBoundingClientRect();
                    const scrollBuffer = 200;
                    if (rect.top <= window.innerHeight - scrollBuffer && rect.bottom >= 0) {
                        // #section-roles is visible, show nav-bar on desktop
                        const mediaQuery = window.matchMedia('(min-width: 751px)');
                        if (mediaQuery.matches) {
                            navBar.classList.remove('hidden');
                            showNav.classList.remove('visible');
                            hasOpenedOnce = true;  // flag to prevent reopening
                        }
                    }
                }
            }

            // function to toggle navigation based on device size
            function toggleNavOnMobile() {
                const mediaQuery = window.matchMedia('(min-width: 751px)');
                if (!mediaQuery.matches) {
                    // if mobile device (less than 750px), hide nav-bar and show arrow
                    navBar.classList.add('hidden');
                    showNav.classList.add('visible');
                } else {
                    // if desktop device, show nav-bar and hide arrow
                    // turned off to test
                    // might rewrite to open automatically after scrolling to trigger
                    
                    // navBar.classList.remove('hidden');
                    // showNav.classList.remove('visible');
                    navBar.classList.add('hidden');
                    showNav.classList.add('visible');
                }
            }

            // disable on desktop too
            toggleNavOnMobile();

            // recheck when resizing
            window.addEventListener('resize', toggleNavOnMobile);
            window.addEventListener('scroll', handleScroll);

        } catch(e) {
            console.log("Nav element not found.", e);
        }
    }
    
});
