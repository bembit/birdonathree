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
        // optionally update the UI. if favorite soring is enabled
        // rerender for unfavoriting?
        // renderProjects();
    };

    // Update favorites count in the header or elsewhere
    const updateFavoritesCount = () => {
        const countElement = document.querySelector('.favorites-count');
        if (countElement) {
            countElement.innerText = favorites.length;
        }
    };
    // initial
    updateFavoritesCount();

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
    // or just hide all the filters by default?
    const INITIAL_VISIBLE_TAGS = 0;

    // Track whether all tags are currently shown
    let isShown = false;

    // Create buttons
    const showAllButton = document.createElement('button');
    const hideAllButton = document.createElement('button');

    showAllButton.innerText = 'Show tags';
    showAllButton.classList.add('btn');

    // add btn to clear tags
    hideAllButton.innerText = 'Hide tags';
    hideAllButton.classList.add('btn');

    // Render tags with toggleable buttons
    const renderTags = () => {
        tagsContainer.innerHTML = '';

        if (isShown) {
            // Show all tags
            uniqueTags.forEach(tag => createTagItem(tag));
            tagsContainer.appendChild(hideAllButton); // Add "Hide All" button
        } else {
            // Show limited tags
            uniqueTags.slice(0, INITIAL_VISIBLE_TAGS).forEach(tag => createTagItem(tag));
            if (uniqueTags.length > INITIAL_VISIBLE_TAGS) {
                tagsContainer.appendChild(showAllButton); // Add "Show All" button
            }
        }
    };

    // Handle "Show All" button click
    showAllButton.addEventListener('click', () => {
        isShown = true; // Set state to show all tags
        renderTags(); // Re-render the tags
    });

    // Handle "Hide All" button click
    hideAllButton.addEventListener('click', () => {
        isShown = false; // Set state to hide extra tags
        renderTags(); // Re-render the tags
    });

    // Create individual tag items
    const createTagItem = (tag) => {
        const tagItem = document.createElement('li');
        tagItem.innerText = tag;

        // Toggle selected state on click
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
    };

    // generate and sort unique tags
    // sort by occurance? like, most used tags? idontknow
    const uniqueTags = generateUniqueTags(projects).sort((a, b) => a.localeCompare(b));

    // Render the initial tags
    renderTags();


    // ###### old filters
    // const uniqueTags = generateUniqueTags(projects).sort((a, b) => a.localeCompare(b));

    // uniqueTags.forEach(tag => {
    //     const tagItem = document.createElement('li');
    //     tagItem.innerText = tag;
    //     tagItem.addEventListener('click', () => {
    //         if (selectedTags.has(tag)) {
    //             selectedTags.delete(tag);
    //             tagItem.classList.remove('selected');
    //         } else {
    //             selectedTags.add(tag);
    //             tagItem.classList.add('selected');
    //         }
    //         filterProjects();
    //     });
    //     tagsContainer.appendChild(tagItem);
    // });

    // Render project items in increments
    const renderProjects = () => {
        // Sort projects: prioritize favorites, then by dateCreated (newest first)
        const sortedProjects = [...filteredProjects].sort((a, b) => {
            
            // turned off for now, dropdown is better
            // const isAFavorited = favorites.includes(a.id);
            // const isBFavorited = favorites.includes(b.id);

            // // Prioritize favorites
            // if (isAFavorited && !isBFavorited) return -1; // `a` is a favorite
            // if (!isAFavorited && isBFavorited) return 1;  // `b` is a favorite

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

    // Create "Clear Filters" button once (to avoid duplicating elements)
    const clearFiltersButton = document.createElement('button');
    clearFiltersButton.innerText = 'Clear Filters';
    clearFiltersButton.classList.add('btn');

    // Clear all selected tags when "Clear Filters" button is clicked
    clearFiltersButton.addEventListener('click', () => {
        selectedTags.clear(); // Clear all selected tags
        // searchInput.value = ''; 
        isShown = false; // Reset to default tag display
        // dont rerender just remove the CSS active styles.
        // renderTags(); // Re-render tags
        filterProjects(); // Re-apply project filtering
    });


    // clear btn
    const clearSearchInput = document.createElement('button');
    clearSearchInput.innerText = 'Clear Search';
    // clearSearchInput.classList.add('btn');

    clearSearchInput.addEventListener('click', () => {
        searchInput.value = ''; // Clear search input
        clearSearchInput.remove(); // Remove the button
        filterProjects(); // Re-run filtering logic
    });

    // Filter projects based on search input and selected tags
    const filterProjects = () => {
        const searchText = searchInput.value.toLowerCase();

        // Reference to the container holding the input field
        const searchContainer = searchInput.parentNode;

        // Add the button only if there's text in the input and it's not already added
        if (searchText.length > 0 && !searchContainer.contains(clearSearchInput)) {
            searchContainer.appendChild(clearSearchInput);
        } else if (searchText.length === 0 && searchContainer.contains(clearSearchInput)) {
            // Remove the button if the input is cleared
            clearSearchInput.remove();
        }
        
        // Filter the projects
        filteredProjects = projects.filter(project => {
            const matchesText = project.title.toLowerCase().includes(searchText) ||
                                project.subtitle.toLowerCase().includes(searchText);
            
            const projectTagsLowercase = project.tags.map(tag => tag.toLowerCase());
            const matchesTags = Array.from(selectedTags).every(tag => projectTagsLowercase.includes(tag));
            
            return matchesText && matchesTags;
        });

        // Update the UI based on selected tags
        if (selectedTags.size > 0) {
            // this needs to be reworked once more to be able to open more filters even if one is already selected.
            showAllButton.style.display = 'none';
            hideAllButton.style.display = 'none';

            // Show "Clear Filters" button
            if (!tagsContainer.contains(clearFiltersButton)) {
                tagsContainer.appendChild(clearFiltersButton);
            }
        } else {
            // Show "Show All" and "Hide All" buttons
            showAllButton.style.display = 'block';
            hideAllButton.style.display = 'block';

            // Hide "Clear Filters" button
            if (tagsContainer.contains(clearFiltersButton)) {
                tagsContainer.removeChild(clearFiltersButton);
            }
        }

        itemsToShow = ITEMS_INCREMENT; // Reset to initial count on new filter
        renderProjects(); // Render the filtered projects
    };


    // Load more projects on button click
    loadMoreButton.addEventListener('click', () => {
        itemsToShow += ITEMS_INCREMENT;
        renderProjects();
    });


    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };
    
    // debounce this
    // searchInput.addEventListener('input', debounce(filterProjects, 500));
    // searchInput.addEventListener('input', filterProjects);
    searchInput.addEventListener('input', debounce(filterProjects, 300));
    

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

    // Add onclick to ignore clicks.
    // Populate dropdown menu
    const populateDropdown = () => {
        dropdownMenu.innerHTML = ''; // Clear previous items
        const favoriteProjects = getFavoriteProjects(); // Get favorite projects

        // Remove from favorites tomorrow here too then rerender the dropdown, update the count, and so on? maybe..
        // if (isFavorited(projectId)) {
            // favorites = favorites.filter(id => id !== projectId); 

        if (favoriteProjects.length > 0) {

            favoriteProjects.forEach(favorite => {

                // or should I do the sneaky webshop way and put them on a separate page?
                // question is, should we rerender fucking everything or not?
                // or should I use React? hah good one.
                console.log(favoriteProjects);

                let createFavoriteButton = document.createElement('button');
                createFavoriteButton.innerText = isFavorited(favorite.id) ? '❤️' : '🤍';
                createFavoriteButton.classList.add('favorite-btn');
                createFavoriteButton.title = 'Add to favorites';
                createFavoriteButton.addEventListener('click', () => {
                    toggleFavorite(favorite.id, createFavoriteButton);
                });

                const listItem = document.createElement("li");
                listItem.innerHTML = `<a href="${favorite.url}" class="project-item project-item-favorite">
                                        <h4 >${favorite.title}</h4>
                                        <img src="${favorite.image}">
                                        </a>
                                        `;
                listItem.appendChild(createFavoriteButton);
                dropdownMenu.appendChild(listItem);
                // const linkToAll = document.createElement("a");
                // linkToAll.innerHTML = "View All";
                // linkToAll.href = "#";
                // dropdownMenu.appendChild(linkToAll);
                // <a href="">View all saved</a>
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
