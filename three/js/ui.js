// probably not needed
// this might not be needed since we open in new tab
function toggleFullscreen() {
    let isNavHidden = document.querySelector("nav").classList.contains("hide");
    let isAsideHidden = document.querySelector("aside").classList.contains("hide");
    let isHeaderHidden = document.querySelector("header").classList.contains("hide");
    switch (true) {
        case isNavHidden && isAsideHidden && isHeaderHidden:
            toggleHeader(); 
            toggleAside(); 
            toggleNav();
            break;
        default:
            toggleHeader(); 
            break;
    }
}

function toggleHeader() {
    toggleElement(
        "header"
    );
}

// when the header comes back to the dom as a sticky element, the main's margin-top should be 0
function toggleStickyNav() {
    let header = document.querySelector('header');
    let isChecked = document.getElementById('toggleStickyNav').checked;
    let main = document.querySelector('main');

    if (isChecked) {
        header.style.position = 'sticky';
        main.style.marginTop = '0';
        header.style.backgroundColor = 'var(--secondary)';
        header.style.zIndex = '100';
        header.style.borderTopRightRadius = '0px';
        header.style.borderTopLeftRadius = '0px';
        header.style.borderBottom = "3px solid var(--tertiary)";
    } else {
        header.style.position = 'absolute';
        header.style.backgroundColor = 'transparent';
        header.style.zIndex = '0';
        main.style.marginTop = 'var(--header-height)';
        header.style.borderRadius = '25px';
        header.style.borderBottom = "none";
    }
}