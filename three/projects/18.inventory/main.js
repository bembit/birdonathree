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
    "Helmet": "./img/helmet.jpg",
    "Shield": "./img/shield.jpg",
    "Gloves": "./img/gloves.jpg",
    "Ring": "./img/ring.jpg",
}

function getItemColor(itemType) {
    const colors = {
        "Helmet": "lightblue",
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

let inventory = [];
console.log(inventory);

const inventoryWidth = 20;
const inventoryHeight = 8;
const inventoryGrid = Array.from({ length: inventoryHeight }, () => Array(inventoryWidth).fill(null));
const inventoryContainer = document.getElementById('inventory');

// based on Y - from up to down first approach
// function findSpaceForItem(width, height) {
//     for (let x = 0; x <= inventoryWidth - width; x++) {
//         for (let y = 0; y <= inventoryHeight - height; y++) {
//             let fits = true;
//             for (let dy = 0; dy < height; dy++) {
//                 for (let dx = 0; dx < width; dx++) {
//                     if (inventoryGrid[y + dy][x + dx] !== null) {
//                         fits = false;
//                         break;
//                     }
//                 }
//                 if (!fits) break;
//             }
//             if (fits) return { x, y };
//         }
//     }
//     return null;
// }

// debug print
// I wonder how do these work in games, do they flag columns if full for specific size?
function findSpaceForItem(width, height) {
    console.log(`Looking for space for item of size ${width}x${height} in inventory...`);

    for (let x = 0; x <= inventoryWidth - width; x++) {
        for (let y = 0; y <= inventoryHeight - height; y++) {
            let fits = true;
            console.log(`Checking space at position (X: ${x}, Y: ${y})...`);

            // loop through each grid cell in the potential space
            for (let dy = 0; dy < height; dy++) {
                for (let dx = 0; dx < width; dx++) {
                    // check if the grid cell is already occupied
                    if (inventoryGrid[y + dy][x + dx] !== null) {
                        fits = false;
                        console.log(`  - Space at (X: ${x + dx}, Y: ${y + dy}) is occupied.`);
                        break;  // no need to check further, this position doesn't fit
                    } else {
                        console.log(`  - Space at (X: ${x + dx}, Y: ${y + dy}) is empty.`);
                    }
                }
                if (!fits) break;  // if a cell is occupied, stop checking this space
            }

            // if space is valid (all cells are empty), return the position
            if (fits) {
                console.log(`Found space at position (X: ${x}, Y: ${y}) for item of size ${width}x${height}`);
                console.log(
                    "%c---------------------",
                    "color: red"
                  );
                return { x, y };
            }
        }
    }

    // take a random sound from the two available
    const inventorySounds = ['./sounds/invfull.ogg', './sounds/invfull2.ogg'];
    let sound = inventorySounds[Math.floor(Math.random() * inventorySounds.length)];
    playSound(sound);

    console.log("No space available for the item.");
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

    // set the x and y coordinates on the item
    newItem.x = position.x;
    newItem.y = position.y;

    // put the item in the grid
    for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
            inventoryGrid[position.y + dy][position.x + dx] = newItem;
        }
    }
    inventory.push(newItem);
    let itemSounds = ['./sounds/item.ogg', './sounds/item2.ogg'];
    let sound = itemSounds[Math.floor(Math.random() * itemSounds.length)];
    playSound(sound);
    renderInventorySummary();
    console.log(inventory);
    renderInventory();
}

function renderInventorySummary() {
    const summaryContainer = document.getElementById('summary');
    summaryContainer.innerHTML = '';
    for (const item of inventory) {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.name} (${item.x}, ${item.y})`;

        const itemColor = getItemColor(item.type);  // get the color for the item type
        listItem.style.color = itemColor;
        summaryContainer.appendChild(listItem);
    }
}

function removeItemFromInventory(itemId) {

    inventory = inventory.filter(item => item.id !== itemId);
    
    // remove item from the grid
    for (let y = 0; y < inventoryHeight; y++) {
        for (let x = 0; x < inventoryWidth; x++) {
            if (inventoryGrid[y][x] && inventoryGrid[y][x].id === itemId) {
                inventoryGrid[y][x] = null;  // clear occupied cells
            }
        }
    }

    console.log("Item removed:", itemId);
    renderInventory();
}

function renderInventory() {
    inventoryContainer.innerHTML = '';
  
    // render the grid cells
    for (let y = 0; y < inventoryHeight; y++) {
        for (let x = 0; x < inventoryWidth; x++) {
            const cell = document.createElement('div');
            cell.classList.add('inventory-cell');
            
            // if an item occupies this cell, mark it as occupied
            const item = inventoryGrid[y][x];

            if (item) {
                cell.classList.add('occupied');
                cell.style.backgroundColor = getItemColor(item.type);
            
                // if this is the top-left cell of the item, add a popup for item stats
                const isTopLeftCell = (x === item.x && y === item.y);

                if (isTopLeftCell) {
                    const itemPopup = document.createElement('div');
                    itemPopup.classList.add('item-popup');
                    itemPopup.innerHTML = generateItemStats(item);
                    cell.appendChild(itemPopup);
                }
            }
            inventoryContainer.appendChild(cell);
        }
    }
  
    // should match CSS grid cell size
    const cellWidth = 30;
    const cellHeight = 30;
    
    for (const item of inventory) {
        const overlay = document.createElement('div');
        overlay.classList.add('item-overlay');

        // position the overlay to cover the area occupied by the item.
        // inventory grid starts at (0,0) in grid coordinates.
        overlay.style.left = `${item.x * cellWidth}px`;
        overlay.style.top = `${item.y * cellHeight}px`;
        overlay.style.width = `${item.size[0] * cellWidth}px`;
        overlay.style.height = `${item.size[1] * cellHeight}px`;
        
        // aply the background image so it spans the full area.
        overlay.style.backgroundImage = `url(${item.image})`;
        // overlay.style.backgroundSize = `${item.size[0] * cellWidth}px ${item.size[1] * cellHeight}px`;
        // overlay.style.backgroundSize = "cover";

        // inventoryContainer position: relative
        inventoryContainer.appendChild(overlay);
    }
}
  
function renderItemTypeList() {
    const itemTypeListContainer = document.getElementById('item-type-list');
    itemTypeListContainer.innerHTML = '';

    // count occurrences of each item type
    const itemTypeCounts = {};
    for (const item of inventory) {
        if (itemTypeCounts[item.type]) {
            itemTypeCounts[item.type]++;
        } else {
            itemTypeCounts[item.type] = 1;
        }
    }

    const totalItems = inventory.length;

    // render each item type and its percentage
    for (const itemType of Object.keys(itemTypeCounts)) {
        const count = itemTypeCounts[itemType];
        const percentage = ((count / totalItems) * 100).toFixed(2);
        const listItem = document.createElement('li');
        
        listItem.textContent = `${itemType}: ${count} (${percentage}%)`;

        itemTypeListContainer.appendChild(listItem);
    }
}

function generateItemStats(item) {
    return `
        <strong>Name:</strong> ${item.name}<br>
        <strong>Prefix:</strong> ${item.prefix}<br>
        <strong>Suffix:</strong> ${item.suffix}<br>
        <strong>Size:</strong> ${item.size.join('x')}<br>
        <button onclick="removeItemFromInventory(${item.id})">Delete</button>
    `;
}

function resetInventory() {
    inventory.forEach(item => removeItemFromInventory(item.id));
    inventory = [];
    if (inventory.length === 0) {
        console.log("Inventory is 0");
        let kekSound = ['./sounds/reset.ogg'];
        let sound = kekSound[Math.floor(Math.random() * kekSound.length)];
        playSound(sound);
        renderInventory();
        renderItemTypeList();
    }
}

let currentAudio = null;

function playSound(sound) {
    // pause current
    if (currentAudio && !currentAudio.paused) {
        currentAudio.pause();
        console.log('Paused previous sound.');
    }

    // play new
    const audio = new Audio(sound);
    audio.volume = 0.1;
    audio.play();
    
    // set as current
    currentAudio = audio;
    
    console.log(`Playing sound: ${sound}`);
}

// check if a sound is currently playing
function isSoundPlaying() {
    return currentAudio && !currentAudio.paused;
}

document.getElementById('addToInventory').addEventListener('click', placeItemInInventory);
document.getElementById('addToInventory').addEventListener('click', renderItemTypeList);
document.getElementById('resetInventory').addEventListener('click', resetInventory);

// init
renderInventory();
