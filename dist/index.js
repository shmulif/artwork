import { fetchAllAnimals } from './api_requests.js';
function formatAnimal(artwork) {
    let formattedAnimal = `<a class="product-in-list" href="animal_display.html?id=${artwork.id}">
                                <p class ="product-name">${artwork.name}</p>
                                <div class="product-image-wrapper">
                                    <img class="product-image" src="${artwork.image}">
                                </div>
                                </a>`;
    return formattedAnimal;
}
async function createAllItemsDisplay() {
    const [responce, data] = await fetchAllAnimals();
    if (responce === 200) {
        data.sort((a, b) => a.name.localeCompare(b.name));
        let result = '';
        for (const animal of data) {
            result += formatAnimal(animal);
        }
        return result;
    }
    else {
        return `<p>${JSON.stringify(data)}</p>`; // Return html containing the error
    }
}
// Item display
async function updateItemsDisplay() {
    const allItemsElement = document.getElementById("all-items");
    // Check if the element exists before attempting to update it
    if (allItemsElement) {
        // Wait for the asynchronous function to complete
        allItemsElement.innerHTML = await createAllItemsDisplay();
    }
    else {
        console.error("Element with ID 'all-items' not found.");
    }
}
// Call the update function
updateItemsDisplay();
