import { fetchOneAnimal } from './api_requests.js';
formatAnimalDisplayPage();
async function formatAnimalDisplayPage() {
    const id = getCurrentAnimalId();
    const currentAnimal = await fetchCurrentAnimal(id);
    updatePageTitle(currentAnimal.name);
    const pageDisplay = document.getElementById("main-container");
    // Check if the element exists before attempting to update it
    if (pageDisplay) {
        // Wait for the asynchronous function to complete
        pageDisplay.innerHTML = createAnimalDisplay(currentAnimal);
    }
    else {
        console.error("Element with ID 'main-container' not found.");
    }
}
function getCurrentAnimalId() {
    // Get the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id === null || id === undefined) {
        console.log('ID is null');
        window.location.href = 'index.html';
    }
    return id;
}
async function fetchCurrentAnimal(id) {
    const [response, result] = await fetchOneAnimal(id);
    if (response === 404 || response === 500) {
        window.location.href = 'index.html';
    }
    return result;
}
function createAnimalDisplay(animal) {
    let display = '';
    display +=
        `<h1 id="title" class="title-heading">${animal.name}</h1>
        <img class="title-image" src="${animal.image}" alt="images/placeholder.svg">
        <h2 id="about" class="about-label">About</h2>

        ${formatDescription(animal.description)}`;
    return display;
}
function formatDescription(description) {
    let formattedDescription = '';
    for (const paragraph of description) {
        formattedDescription += `<p class="about-paragraph">${paragraph}</p>`;
    }
    return formattedDescription;
}
function updatePageTitle(newTitle) {
    const title = document.getElementById("title");
    // Check if the element exists before attempting to update it
    if (title) {
        // Wait for the asynchronous function to complete
        title.innerHTML = newTitle;
    }
    else {
        console.error("Element with ID 'title' not found.");
    }
}
