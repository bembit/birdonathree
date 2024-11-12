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


    // Function to create a project item
    const createProjectItem = (project) => {
        let createDiv = document.createElement('div');
        createDiv.classList.add('project-item');

        createDiv.addEventListener('mouseover', () => {
            createDiv.style.backgroundImage = `linear-gradient(to bottom, rgba(0, 0, 0, 0.85), rgba(0,0,0,0.75)), url(${project.image})`;
        });
        createDiv.addEventListener('mouseout', () => {
            createDiv.style.backgroundImage = 'none';
        });

        let createHeading3 = document.createElement('h3');
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
        container.innerHTML = '';
        const projectsToDisplay = filteredProjects.slice(0, itemsToShow);
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
});
