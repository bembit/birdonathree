const data = async () => {
    const response = await fetch('./projects.json');
    const projects = await response.json();
    return projects;
};

data().then(projects => {

    const container = document.querySelector('.all-projects-container');
    const tagsContainer = document.querySelector('.tags-container ul');
    const searchInput = document.querySelector('.search-container input[type="text"]');
    const loadMoreButton = document.createElement('button');
    loadMoreButton.innerText = 'Load More';
    loadMoreButton.classList.add('btn');

    const mainContainer = document.querySelector('.container');
    mainContainer.appendChild(loadMoreButton);

    // Display settings
    const ITEMS_INCREMENT = 9;
    let itemsToShow = ITEMS_INCREMENT;
    let filteredProjects = projects; // Holds the currently filtered projects

    let selectedTags = new Set();

    // Helper to generate unique tags
    // ignore case
    const generateUniqueTags = (projects) => {
        const allTags = projects.flatMap(project => project.tags.map(tag => tag.toLowerCase()));
        return [...new Set(allTags)];
    };

    // ###### Helpers for favorites

    // Track favorites
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    // Update LocalStorage
    const updateFavoritesStorage = () => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
        console.log('Favorites updated:', favorites);
    };

    // Check if a project is favorited
    const isFavorited = (projectId) => favorites.includes(projectId);

    // Toggle favorite status
    const toggleFavorite = (projectId, button) => {
        if (isFavorited(projectId)) {
            favorites = favorites.filter(id => id !== projectId); // Remove from favorites
            button.innerText = '🤍'; // Unfavorited state
        } else {
            favorites.push(projectId); // Add to favorites
            button.innerText = '❤️'; // Favorited state
        }
        updateFavoritesStorage();
        updateFavoritesCount(); // Optionally update a favorites counter in the UI
        renderProjects(); // Optionally update the UI
    };

    // Update favorites count in the header or elsewhere
    const updateFavoritesCount = () => {
        const countElement = document.querySelector('.favorites-count');
        if (countElement) {
            countElement.innerText = favorites.length;
        }
    };

    // ######## Function to create a project item
    const createProjectItem = (project) => {
        let createDiv = document.createElement('div');
        createDiv.classList.add('project-item');
        createDiv.style.backgroundImage = `linear-gradient(to bottom, rgba(0, 0, 0, 0.85), rgba(0,0,0,0.75)), url(${project.image})`;

        // on hover maybe later
        // createDiv.addEventListener('mouseover', () => {
        //     createDiv.style.backgroundImage = `linear-gradient(to bottom, rgba(0, 0, 0, 0.85), rgba(0,0,0,0.75)), url(${project.image})`;
        // });
        // createDiv.addEventListener('mouseout', () => {
        //     createDiv.style.backgroundImage = 'none';
        // });

        // Favorite button
        let createFavoriteButton = document.createElement('button');
        createFavoriteButton.innerText = isFavorited(project.id) ? '❤️' : '🤍';
        createFavoriteButton.classList.add('favorite-btn');
        createFavoriteButton.title = 'Add to favorites';
        createFavoriteButton.addEventListener('click', () => {
            toggleFavorite(project.id, createFavoriteButton);
        });

        let createHeading3 = document.createElement('h3');
        createHeading3.classList.add('gradient');
        createHeading3.innerText = project.title;

        let createDate = document.createElement('p');
        createDate.innerText = project.dateCreated;

        let createParagraph = document.createElement('p');
        createParagraph.innerText = project.subtitle;

        let createTags = document.createElement('ul');
        createTags.innerHTML = project.tags.map(tag => `<li>${tag}</li>`).join('');

        let createAnchor = document.createElement('a');
        createAnchor.innerText = 'View';
        createAnchor.href = project.url;
        createAnchor.classList.add('btn');

        createDiv.appendChild(createFavoriteButton);

        createDiv.appendChild(createHeading3);
        createDiv.appendChild(createDate);
        createDiv.appendChild(createParagraph);
        createDiv.appendChild(createTags);
        createDiv.appendChild(createAnchor);

        container.appendChild(createDiv);
    };

    // generate unique tags
    // add tags by alphabetical order
    const uniqueTags = generateUniqueTags(projects).sort((a, b) => a.localeCompare(b));

    uniqueTags.forEach(tag => {
        const tagItem = document.createElement('li');
        tagItem.innerText = tag;
        tagItem.addEventListener('click', () => {
            if (selectedTags.has(tag)) {
                selectedTags.delete(tag);
                tagItem.classList.remove('selected');
            } else {
                selectedTags.add(tag);
                tagItem.classList.add('selected');
            }
            filterProjects();
        });
        tagsContainer.appendChild(tagItem);
    });

    // Render project items in increments
    const renderProjects = () => {
        // Sort projects: prioritize favorites, then by dateCreated (newest first)
        const sortedProjects = [...filteredProjects].sort((a, b) => {
            const isAFavorited = favorites.includes(a.id);
            const isBFavorited = favorites.includes(b.id);

            // Prioritize favorites
            if (isAFavorited && !isBFavorited) return -1; // `a` is a favorite
            if (!isAFavorited && isBFavorited) return 1;  // `b` is a favorite

            // If both or neither are favorites, sort by dateCreated (newest first)
            const dateA = new Date(a.dateCreated);
            const dateB = new Date(b.dateCreated);
            return dateB - dateA; // Newest first
        });

        container.innerHTML = '';
        const projectsToDisplay = sortedProjects.slice(0, itemsToShow);
        projectsToDisplay.forEach(createProjectItem);

        // Show or hide "Show More" button
        loadMoreButton.style.display = itemsToShow < filteredProjects.length ? 'block' : 'none';
    };


    // Filter projects based on search input and selected tags
    const filterProjects = () => {
        const searchText = searchInput.value.toLowerCase();

        filteredProjects = projects.filter(project => {
            const matchesText = project.title.toLowerCase().includes(searchText) ||
                                project.subtitle.toLowerCase().includes(searchText);
            
            const projectTagsLowercase = project.tags.map(tag => tag.toLowerCase());
            const matchesTags = Array.from(selectedTags).every(tag => projectTagsLowercase.includes(tag));
    
            return matchesText && matchesTags;
        });
    
        itemsToShow = ITEMS_INCREMENT; // Reset to initial count on new filter
        renderProjects();
    };

    // Load more projects on button click
    loadMoreButton.addEventListener('click', () => {
        itemsToShow += ITEMS_INCREMENT;
        renderProjects();
    });

    // Listen to search input changes
    searchInput.addEventListener('input', filterProjects);

    // Initial render
    renderProjects();


    // Favorites dropdown
    console.log(favorites)
    // Example favorites array
    // Populate dropdown menu
    const dropdownLink = document.getElementById("dropdown");
    const dropdownMenu = document.getElementById("dropdown-menu");
    
    // Function to map favorite IDs to project data
    const getFavoriteProjects = () => {
        return favorites.map(favoriteId => {
            return projects.find(project => project.id === favoriteId);
        }).filter(Boolean); // Filter out undefined in case of mismatched IDs
    };

    // Populate dropdown menu
    const populateDropdown = () => {
        dropdownMenu.innerHTML = ''; // Clear previous items
        const favoriteProjects = getFavoriteProjects(); // Get favorite projects

        if (favoriteProjects.length > 0) {
            favoriteProjects.forEach(favorite => {
                const listItem = document.createElement("li");
                listItem.innerHTML = `<div class="project-item-favorite">
                                        <a href="${favorite.url}">${favorite.title}</a>
                                        <img style="width: 100px;" src="${favorite.image}">

                                        </div>`; 
                dropdownMenu.appendChild(listItem);
            });
        } else {
            dropdownMenu.innerHTML = '<li>No favorites yet.</li>';
        }
    };

    // Toggle dropdown visibility
    dropdownLink.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default link behavior
        const isVisible = dropdownMenu.style.display === "flex";
        dropdownMenu.style.display = isVisible ? "none" : "flex";
        if (!isVisible) populateDropdown(); // Populate only when opening
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener("click", (event) => {
        if (!dropdownLink.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.style.display = "none";
        }
    });
});
