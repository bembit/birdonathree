// single cell render with light blue
function renderInventory() {
    inventoryContainer.innerHTML = '';
    for (let y = 0; y < inventoryHeight; y++) {
        for (let x = 0; x < inventoryWidth; x++) {
            const cell = document.createElement('div');
            cell.classList.add('inventory-cell');
            if (inventoryGrid[y][x]) {
                cell.textContent = inventoryGrid[y][x][0];
                cell.classList.add('occupied');
            }
            inventoryContainer.appendChild(cell);
        }
    }
}

// based on X
function findSpaceForItem(width, height) {
    for (let y = 0; y <= inventoryHeight - height; y++) {
        for (let x = 0; x <= inventoryWidth - width; x++) {
            let fits = true;
            for (let dy = 0; dy < height; dy++) {
                for (let dx = 0; dx < width; dx++) {
                    if (inventoryGrid[y + dy][x + dx] !== null) {
                        fits = false;
                        break;
                    }
                }
                if (!fits) break;
            }
            if (fits) return { x, y };
        }
    }
    return null;
}

// -- could be picked by stat. order names by potential stats
// construct item based on base and prefix/suffix
function getFullItem() {
    const itemBase = getRandomItemType();
    const itemBaseName = itemBase.charAt(0).toUpperCase() + itemBase.slice(1);
    const prefix = getPrefix();
    const suffix = getSuffix();
    return `${prefix} ${itemBaseName} ${suffix}`;
}

function getPrefix() {
    return itemPrefixNames[Math.floor(Math.random() * itemPrefixNames.length)];
}

function getSuffix() {
    return itemSuffixNames[Math.floor(Math.random() * itemSuffixNames.length)];
}

// inventory render should have options on hover

function generateItem() {
    const name = getName();
    inventory.push(name);
    console.log(inventory);
    // rerender ui container
    renderInventory();
}

// full

// store names in arrays tmp
const itemPrefixNames = ["Heroic", "Sadists", "Peacekeepers", "Huge"];
const itemSuffixNames = ["of the Monkey", "of the Eagle", "of the Owl"];

const itemBaseTypes = ["Helmet", "Shield", "Ring", "Gloves"];
// what would be a good structure for this data to be further tailored by stats?
const itemSizes = {
    "Helmet": [2, 2],
    "Shield": [2, 3],
    "Gloves": [2, 2],
    "Ring": [1, 1]
};
const itemImages = {
    "Helmet": "./helmet.jpg",
    "Shield": "./shield.jpg",
    "Gloves": "./gloves.jpg",
    "Ring": "./ring.jpg",
}

function getItemColor(itemType) {
    const colors = {
        "Helmet": "blue",
        "Shield": "red",
        "Gloves": "green",
        "Ring": "gold"
    };
    return colors[itemType] || "white";
}

function getRandomItemType() {
    return itemBaseTypes[Math.floor(Math.random() * itemBaseTypes.length)];
}

// items should be indexed by ID to further manipulation
let inventory = [];
console.log(inventory);
const inventoryWidth = 20;
const inventoryHeight = 8;
const inventoryGrid = Array.from({ length: inventoryHeight }, () => Array(inventoryWidth).fill(null));
const inventoryContainer = document.getElementById('inventory');

// based on Y
function findSpaceForItem(width, height) {
    for (let x = 0; x <= inventoryWidth - width; x++) {
        for (let y = 0; y <= inventoryHeight - height; y++) {
            let fits = true;
            for (let dy = 0; dy < height; dy++) {
                for (let dx = 0; dx < width; dx++) {
                    if (inventoryGrid[y + dy][x + dx] !== null) {
                        fits = false;
                        break;
                    }
                }
                if (!fits) break;
            }
            if (fits) return { x, y };
        }
    }
    return null;
}

function placeItemInInventory(itemType) {
    const [width, height] = itemSizes[itemType];
    const position = findSpaceForItem(width, height);
    if (!position) {
        console.log("No space available for", itemType);
        return;
    }
    for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
            inventoryGrid[position.y + dy][position.x + dx] = itemType;
        }
    }
    inventory.push(itemType);
    console.log(inventory);
    renderInventory();
}

function renderInventory() {
    inventoryContainer.innerHTML = '';
    for (let y = 0; y < inventoryHeight; y++) {
        for (let x = 0; x < inventoryWidth; x++) {
            const cell = document.createElement('div');
            cell.classList.add('inventory-cell');
            if (inventoryGrid[y][x]) {
                const itemType = inventoryGrid[y][x];
                cell.textContent = itemType[0];
                cell.classList.add('occupied');
                cell.style.backgroundColor = getItemColor(itemType);
            }
            inventoryContainer.appendChild(cell);
        }
    }
}

document.getElementById('addToInventory').addEventListener('click', () => {
    const itemType = getRandomItemType();
    placeItemInInventory(itemType);
});

// init
renderInventory();


// 

// store names in arrays tmp
const itemPrefixNames = ["Heroic", "Sadists", "Peacekeepers", "Huge"];
const itemSuffixNames = ["of the Monkey", "of the Eagle", "of the Owl"];

const itemBaseTypes = ["Helmet", "Shield", "Ring", "Gloves"];
const itemSizes = {
    "Helmet": [2, 2],
    "Shield": [2, 3],
    "Gloves": [2, 2],
    "Ring": [1, 1]
};
const itemImages = {
    "Helmet": "./helmet.jpg",
    "Shield": "./shield.jpg",
    "Gloves": "./gloves.jpg",
    "Ring": "./ring.jpg",
}

function getItemColor(itemType) {
    const colors = {
        "Helmet": "blue",
        "Shield": "red",
        "Gloves": "green",
        "Ring": "gold"
    };
    return colors[itemType] || "white";
}

function getRandomItemType() {
    return itemBaseTypes[Math.floor(Math.random() * itemBaseTypes.length)];
}

function getRandomItemPrefix() {
    return itemPrefixNames[Math.floor(Math.random() * itemPrefixNames.length)];
}

function getRandomItemSuffix() {
    return itemSuffixNames[Math.floor(Math.random() * itemSuffixNames.length)];
}

let itemCounter = 0;

function generateItem() {
    const itemType = getRandomItemType();
    const itemPrefix = getRandomItemPrefix();
    const itemSuffix = getRandomItemSuffix();
    
    const itemName = `${itemPrefix} ${itemType} ${itemSuffix}`;
    
    return {
        id: itemCounter++,
        type: itemType,
        name: itemName,
        prefix: itemPrefix,
        suffix: itemSuffix,
        size: itemSizes[itemType],
        image: itemImages[itemType],
        x: null,
        y: null
    };
}

// items should be indexed by ID for further manipulation
let inventory = [];
console.log(inventory);

const inventoryWidth = 20;
const inventoryHeight = 8;
const inventoryGrid = Array.from({ length: inventoryHeight }, () => Array(inventoryWidth).fill(null));
const inventoryContainer = document.getElementById('inventory');

// based on Y
function findSpaceForItem(width, height) {
    for (let x = 0; x <= inventoryWidth - width; x++) {
        for (let y = 0; y <= inventoryHeight - height; y++) {
            let fits = true;
            for (let dy = 0; dy < height; dy++) {
                for (let dx = 0; dx < width; dx++) {
                    if (inventoryGrid[y + dy][x + dx] !== null) {
                        fits = false;
                        break;
                    }
                }
                if (!fits) break;
            }
            if (fits) return { x, y };
        }
    }
    return null;
}

function placeItemInInventory() {
    const newItem = generateItem();
    const [width, height] = newItem.size;
    const position = findSpaceForItem(width, height);
    if (!position) {
        console.log("No space available for", newItem.name);
        return;
    }

    // Set the x and y coordinates on the item
    newItem.x = position.x;
    newItem.y = position.y;

    // Place the item in the inventory grid
    for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
            inventoryGrid[position.y + dy][position.x + dx] = newItem;
        }
    }
    inventory.push(newItem);
    renderInventorySummary();
    console.log(inventory);
    renderInventory();
}

function renderInventorySummary() {
    const summaryContainer = document.getElementById('summary');
    summaryContainer.innerHTML = '';
    for (const item of inventory) {
        const itemDiv = document.createElement('div');
        itemDiv.textContent = `${item.name} (${item.x}, ${item.y})`;
        summaryContainer.appendChild(itemDiv);
    }
}

// Function to remove item from inventory
function removeItemFromInventory(itemId) {
    // Find the item in the inventory and remove it
    inventory = inventory.filter(item => item.id !== itemId);
    
    // Remove item from the grid
    for (let y = 0; y < inventoryHeight; y++) {
        for (let x = 0; x < inventoryWidth; x++) {
            if (inventoryGrid[y][x] && inventoryGrid[y][x].id === itemId) {
                inventoryGrid[y][x] = null;  // Clear the occupied cell
            }
        }
    }

    console.log("Item removed:", itemId);
    renderInventory();
}

function renderInventory() {
    inventoryContainer.innerHTML = '';
    for (let y = 0; y < inventoryHeight; y++) {
        for (let x = 0; x < inventoryWidth; x++) {
            const cell = document.createElement('div');
            cell.classList.add('inventory-cell');
            
            const item = inventoryGrid[y][x];
            if (item) {
                // Check if this cell is the "top-left" cell of the item placement
                const isTopLeftCell = (x === item.x && y === item.y);
                if (isTopLeftCell) {
                    cell.textContent = item.name;  // Display item name only once
                    // Create a remove button for the item
                    const removeButton = document.createElement('button');
                    removeButton.textContent = 'Remove';
                    removeButton.onclick = () => removeItemFromInventory(item.id);
                    cell.appendChild(removeButton);
                    cell.style.backgroundImage = `url(${item.image})`;
                }
                cell.classList.add('occupied');
                cell.style.backgroundColor = getItemColor(item.type);
            }
            inventoryContainer.appendChild(cell);
        }
    }
}

function generateItemStats(item) {
    return `
        <strong>Name:</strong> ${item.name}<br>
        <strong>Prefix:</strong> ${item.prefix}<br>
        <strong>Suffix:</strong> ${item.suffix}<br>
        <strong>Size:</strong> ${item.size.join('x')}<br>
        <button onclick="removeItemFromInventory(${item.id})">Remove</button>
    `;
}

document.getElementById('addToInventory').addEventListener('click', placeItemInInventory);

// init
renderInventory();


document.getElementById('generateItem').addEventListener('click', generateItem);
const generatedItem = document.getElementById('generatedItem');
generatedItem.innerHTML = generateItem();

<button id="generateItem">Generate Item</button>
<span id="generatedItem"></span>

function renderInventory() {
    inventoryContainer.innerHTML = '';
    for (let y = 0; y < inventoryHeight; y++) {
        for (let x = 0; x < inventoryWidth; x++) {
            const cell = document.createElement('div');
            cell.classList.add('inventory-cell');
            
            const item = inventoryGrid[y][x];
            if (item) {
                // check and use top left cell only
                const isTopLeftCell = (x === item.x && y === item.y);
                if (isTopLeftCell) {

                    const itemPopup = document.createElement('div');
                    itemPopup.classList.add('item-popup');
                    itemPopup.innerHTML = generateItemStats(item);
                    cell.appendChild(itemPopup);

                    // cell.textContent = item.name;
                    // const removeButton = document.createElement('button');
                    // removeButton.textContent = 'Remove';
                    // removeButton.onclick = () => removeItemFromInventory(item.id);
                    // cell.appendChild(removeButton);

                    cell.style.backgroundImage = `url(${item.image})`;
                }
                // cell.style.backgroundImage = `url(${item.image})`;
                cell.classList.add('occupied');
                cell.style.backgroundColor = getItemColor(item.type);
            }
            inventoryContainer.appendChild(cell);
        }
    }
}

document.getElementById('addInventorySize').addEventListener('click', addInventorySize);

function addInventorySize() {
    inventoryWidth += 8;
    inventoryHeight += 1;
    console.log(inventoryWidth);
    console.log(inventoryHeight);
    inventoryGrid = Array.from({ length: inventoryHeight }, () => Array(inventoryWidth).fill(null));
    renderInventory();
}

<!-- <button id="addInventorySize">Add inventory size</button> -->
<!-- <button id="resetInventory">Move items to Bank</button> -->