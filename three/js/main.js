// sounds are definitely needed..

function playSound(soundId) {
    const sound = document.getElementById(soundId);
    sound.volume = .1; // set volume (0 to 1) - 1 is "fun".
    sound.play();
}


document.addEventListener('DOMContentLoaded', function () {
    const boxes = document.querySelectorAll('.inside-box');
    const arrowLeft = document.querySelector('.arrow-left');
    const arrowRight = document.querySelector('.arrow-right');
    const container = document.querySelector('.expanding-box-container');
    let currentBox = null; // Track the currently expanded box

    // Function to expand a box and show arrows if adjacent boxes exist
    function expandBox(box) {
        container.classList.add('active');
        boxes.forEach(b => b.classList.remove('expanded'));
        box.classList.add('expanded');
        currentBox = box;
        checkArrows();
    }

    // Function to check and display arrows based on adjacent elements
    function checkArrows() {
        if (!currentBox) {
            // Hide arrows if no box is expanded
            arrowLeft.style.display = 'none';
            arrowRight.style.display = 'none';
            return;
        }

        // Check if previous or next box exists
        const hasPrev = currentBox.previousElementSibling && currentBox.previousElementSibling.classList.contains('inside-box');
        const hasNext = currentBox.nextElementSibling && currentBox.nextElementSibling.classList.contains('inside-box');

        arrowLeft.style.display = hasPrev ? 'block' : 'none';
        arrowRight.style.display = hasNext ? 'block' : 'none';

        console.log("Arrows checked: ", { hasPrev, hasNext });

        // Attach click handlers to the arrows
        arrowLeft.onclick = (e) => {
            e.stopPropagation();  // Prevent click event from propagating
            console.log('Navigating left');
            navigateBox('prev');
        };
        arrowRight.onclick = (e) => {
            e.stopPropagation();  // Prevent click event from propagating
            console.log('Navigating right');
            navigateBox('next');
        };
    }

    // Function to navigate between boxes
    function navigateBox(direction) {
        if (!currentBox) {
            console.log('No current box selected');
            return;
        }

        const targetBox = direction === 'prev'
            ? currentBox.previousElementSibling
            : currentBox.nextElementSibling;

        if (targetBox && targetBox.classList.contains('inside-box')) {
            console.log("Navigating to box:", targetBox);

            container.classList.remove('active');
            currentBox.classList.remove('expanded');

            // Update 'currentBox' to the target box
            currentBox = targetBox;

            // Add 'expanded' to the new target box
            expandBox(currentBox);

            simulateClickEffect(currentBox);

            checkArrows();
        } else {
            console.log('No valid target box found');
        }
    }

    // Function to simulate the click effect on the expanded box
    function simulateClickEffect(box) {
        console.log('Simulating click effect on the box:', box);
        // Trigger a custom effect on the expanded box
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
        });
        box.dispatchEvent(clickEvent);
    }

    // Add click listeners to each box for expanding
    boxes.forEach(box => {
        box.addEventListener('click', (e) => {
            e.stopPropagation();
            expandBox(box);
        });
    });

    // Collapse all boxes when clicking outside
    document.addEventListener('click', () => {
        container.classList.remove('active');
        boxes.forEach(box => box.classList.remove('expanded'));
        currentBox = null;
        checkArrows(); // Hide arrows when no box is expanded
    });
});

// ------

// nav sections, active tracking

const navLinks = document.querySelectorAll('.nav-bar ul li a');

const sections = [
    '#top', 
    '#section-roles',
    '#section1', 
    '#section2', 
    '#section4', 
    '#section3', 
    '#section5', 
    '#section6', 
    '#section7',
].map(id => document.querySelector(id));

const observerOptions = {
    root: null, // viewport
    threshold: 0.5 // trigger 
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const navItem = document.querySelector(`a[href="#${entry.target.id}"]`);
        if (entry.isIntersecting) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navItem) {
                navItem.classList.add('active');
            }
        }
    });
}, observerOptions);

sections.forEach(section => {
    if (section) {
        observer.observe(section);
    }
});

// ------

document.addEventListener("DOMContentLoaded", function () {

    console.log("DOM is ready - hello main.js");
    document.body.classList.remove("load");
    // document.getElementById('starfield-canvas').classList.remove('load');

    checkNavigation();

    function checkNavigation() {
        try {
            // smooth scroll behavior for links
            document.querySelectorAll('.nav-bar a, nav a.internal-link, .dropdown-content a').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    document.querySelector(this.getAttribute('href')).scrollIntoView({
                        behavior: 'smooth'
                    });
                });
            });

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
