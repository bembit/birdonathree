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
