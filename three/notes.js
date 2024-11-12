document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM is ready - hello XXXXXXXXX.js");
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
        arrowLeft.onclick = () => {
            console.log('Navigating left');
            navigateBox('prev');
        };
        arrowRight.onclick = () => {
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
            console.log("Navigating to box:", targetBox); // Debugging log

            // Remove 'expanded' from the current box
            currentBox.classList.remove('expanded');
            console.log("Current box:", currentBox); // Debugging log

            // Update 'currentBox' to the target box
            currentBox = targetBox;


            console.log("Current box:", currentBox); // Debugging log
            // Add 'expanded' to the new target box
            // Check if the target already has the 'expanded' class
            if (!currentBox.classList.contains('expanded')) {
                console.log('Adding "expanded" class to', currentBox); // Debugging log
                currentBox.classList.add('expanded');
            } else {
                console.log('Target already has "expanded" class:', currentBox); // Debugging log
            }

            // Check arrows for the new target box
            checkArrows();
        } else {
            console.log('No valid target box found');
        }
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
        currentBox = null; // Clear currentBox when all are collapsed
        checkArrows(); // Hide arrows when no box is expanded
    });
});