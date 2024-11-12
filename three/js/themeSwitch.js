// check if the user prefers dark mode
let prefersDarkColorScheme = () =>
    window &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

    console.log("prefersDarkColorScheme", prefersDarkColorScheme());
    
    if (prefersDarkColorScheme()) {
        let buttons = document.querySelectorAll("button");
        buttons.forEach(button => {
            if(button.textContent.toLowerCase() === "dark") {
                button.classList.add("active");
            } else {
                button.classList.remove("active");
            }
        });
        themeSwitch("dark");
    } else {
        themeSwitch("light");
    }

// track and highlight the current theme on buttons
function trackTheme(theme) {
    let buttons = document.querySelectorAll("button");
    buttons.forEach(button => {
        if(button.textContent.toLowerCase() === theme) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
    });
}

// start as dark and light base
// themes
function themeSwitch(theme) {
    let root = document.documentElement;
    switch(theme) {
        case "light":
            root.style.setProperty("--text-primary", "var(--text-primary-light)");
            root.style.setProperty("--text-secondary", "var(--text-secondary-light)");
            root.style.setProperty("--background-primary", "var(--background-primary-light)");
            root.style.setProperty("--background-primary-opacity", "var(--background-primary-light-opacity)");
            root.style.setProperty("--secondary", "var(--secondary-light)");
            root.style.setProperty("--secondary-opacity", "var(--secondary-light-opacity)");
            root.style.setProperty("--tertiary", "var(--tertiary-light)");
            break;
        case "dark":
            root.style.setProperty("--text-primary", "var(--text-primary-dark)");
            root.style.setProperty("--text-secondary", "var(--text-secondary-dark)");
            root.style.setProperty("--background-primary", "var(--background-primary-dark)");
            root.style.setProperty("--background-primary-opacity", "var(--background-primary-dark-opacity)");
            root.style.setProperty("--secondary", "var(--secondary-dark)");
            root.style.setProperty("--secondary-opacity", "var(--secondary-dark-opacity)");
            root.style.setProperty("--tertiary", "var(--tertiary-dark)");
            break;
        // case "babe":
        //     root.style.setProperty("--text-primary", "var(--text-primary-babe)");
        //     root.style.setProperty("--text-secondary", "var(--text-secondary-babe)");
        //     root.style.setProperty("--background-primary", "var(--background-primary-babe)");
        //     root.style.setProperty("--background-primary-opacity", "var(--background-primary-babe-opacity)");
        //     root.style.setProperty("--secondary", "var(--secondary-babe)");
        //     root.style.setProperty("--secondary-opacity", "var(--secondary-babe-opacity)");
        //     root.style.setProperty("--tertiary", "var(--tertiary-babe)");
        //     break;
        // case "pastel":
        //     root.style.setProperty("--text-primary", "var(--text-primary-pastel)");
        //     root.style.setProperty("--text-secondary", "var(--text-secondary-pastel)");
        //     root.style.setProperty("--background-primary", "var(--background-primary-pastel)");
        //     root.style.setProperty("--background-primary-opacity", "var(--background-primary-pastel-opacity)");
        //     root.style.setProperty("--secondary", "var(--secondary-pastel)");
        //     root.style.setProperty("--secondary-opacity", "var(--secondary-pastel-opacity)");
        //     root.style.setProperty("--tertiary", "var(--tertiary-pastel)");
        //     break;
        // case "pretty":
        //     root.style.setProperty("--text-primary", "var(--text-primary-pretty)");
        //     root.style.setProperty("--text-secondary", "var(--text-secondary-pretty)");
        //     root.style.setProperty("--background-primary", "var(--background-primary-pretty)");
        //     root.style.setProperty("--background-primary-opacity", "var(--background-primary-pretty-opacity)");
        //     root.style.setProperty("--secondary", "var(--secondary-pretty)");
        //     root.style.setProperty("--secondary-opacity", "var(--secondary-pretty-opacity)");
        //     root.style.setProperty("--tertiary", "var(--tertiary-pretty)");
        //     break;
        // case "corpo":
        //     root.style.setProperty("--text-primary", "var(--text-primary-corpo)");
        //     root.style.setProperty("--text-secondary", "var(--text-secondary-corpo)");
        //     root.style.setProperty("--background-primary", "var(--background-primary-corpo)");
        //     root.style.setProperty("--background-primary-opacity", "var(--background-primary-corpo-opacity)");
        //     root.style.setProperty("--secondary", "var(--secondary-corpo)");
        //     root.style.setProperty("--secondary-opacity", "var(--secondary-corpo-opacity)");
        //     root.style.setProperty("--tertiary", "var(--tertiary-corpo)");
        //     break;
        // case "hacky":
        //     root.style.setProperty("--text-primary", "var(--text-primary-hacky)");
        //     root.style.setProperty("--text-secondary", "var(--text-secondary-hacky)");
        //     root.style.setProperty("--background-primary", "var(--background-primary-hacky)");
        //     root.style.setProperty("--background-primary-opacity", "var(--background-primary-hacky-opacity)");
        //     root.style.setProperty("--secondary", "var(--secondary-hacky)");
        //     root.style.setProperty("--secondary-opacity", "var(--secondary-hacky-opacity)");
        //     root.style.setProperty("--tertiary", "var(--tertiary-hacky)");
        //     break;
        default:
            console.error("Unknown theme:", theme);
            break;
    }
}