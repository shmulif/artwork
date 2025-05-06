import { createAnimal } from './api_requests.js';
checkForAuthToken();
function checkForAuthToken() {
    const authToken = localStorage.getItem('authToken');
    // If for some reson there's no auth token redirect to login page
    if (authToken === null) {
        window.location.href = 'login.html';
        return;
    }
}
window.loadSampleData = function () {
    const pageDisplay = document.getElementById("form");
    // Check if the element exists before attempting to update it
    if (pageDisplay) {
        pageDisplay.innerHTML = formatSampleAnimal();
    }
    else {
        console.error("Element with ID 'form' not found.");
    }
};
window.submitCreateAnimalForm = async function (event) {
    event.preventDefault();
    clearError();
    const name = document.getElementById('name');
    const sciName = document.getElementById('sciName');
    const description = document.getElementById('description');
    const images = document.getElementById('images');
    const video = document.getElementById('video');
    const events = document.getElementById('events');
    if (name && sciName && description && images && video && events) {
        const [jsonString, message] = validateAndFormat(name.value, sciName.value, description.value, images.value, video.value, events.value);
        const authToken = localStorage.getItem('authToken');
        if (jsonString === null) {
            displayError(message);
            return;
        }
        if (authToken === null) {
            alert('Unauthenticated. Please login again');
            window.location.href = 'login.html';
            return;
        }
        await handleSubmission(authToken, jsonString);
    }
    else {
        console.error('Input not found');
    }
};
async function handleSubmission(authToken, jsonString) {
    try {
        // Call the login function and destructure the response and result
        const [status, message] = await createAnimal(authToken, jsonString);
        // Handle status codes
        if (status === 201) {
            // alert(message.success) // This was causing the next line not to work
            window.location.href = 'admin.html';
            return;
        }
        if (status === 401) {
            alert('Unauthorized. Credentials may have expired. Please login again');
            localStorage.removeItem('authToken');
            window.location.href = 'login.html';
            return;
        }
        if (status === 400 || status === 500) {
            // Assert that result is an object with an error message
            if (typeof message === 'object' && 'error' in message) {
                displayError(message.error);
            }
            else {
                console.error('Unexpected response format for error status.');
                console.log(message.body);
            }
        }
        else {
            console.error('Unexpected status code:', status);
        }
    }
    catch (error) {
        console.error('An error occurred during login:', error);
    }
}
function displayError(errorMessage) {
    const pageDisplay = document.getElementById("error-message");
    // Check if the element exists before attempting to update it
    if (pageDisplay) {
        pageDisplay.style.color = "red";
        pageDisplay.innerHTML = `${errorMessage}`;
    }
    else {
        console.error("Element with ID 'error-message' not found.");
    }
}
function clearError() {
    const pageDisplay = document.getElementById("error-message");
    // Check if the element exists before attempting to update it
    if (pageDisplay) {
        pageDisplay.innerHTML = '';
    }
    else {
        console.error("Element with ID 'error-message' not found.");
    }
}
function isValidDate(date) {
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    return dateRegex.test(date);
}
function validateAndFormat(name, sciName, description, images, video, events) {
    if (!name) {
        return [null, 'Error: Missing name.'];
    }
    if (!sciName) {
        return [null, 'Error: Missing scientific name.'];
    }
    if (!video) {
        return [null, 'Error: Missing video URL.'];
    }
    const descriptionArray = description.split('\n').filter((line) => line.trim() !== '');
    const imagesArray = images.split('\n').filter((line) => line.trim() !== '');
    const eventsArray = [];
    const eventLines = events.split('\n').filter((line) => line.trim() !== '');
    for (let i = 0; i < eventLines.length; i += 3) {
        if (eventLines[i] && eventLines[i + 1] && eventLines[i + 2]) {
            const eventName = eventLines[i];
            const eventDate = eventLines[i + 1];
            const eventUrl = eventLines[i + 2];
            if (!isValidDate(eventDate)) {
                return [null, `Error: Invalid date format in event at line ${i + 2}.`];
            }
            eventsArray.push({ name: eventName, date: eventDate, url: eventUrl });
        }
        else {
            return [null, `Error: Incomplete event data starting at line ${i + 1}.`];
        }
    }
    const animal = {
        id: crypto.randomUUID(),
        name,
        sciName,
        description: descriptionArray,
        images: imagesArray,
        video,
        events: eventsArray,
        createdByUser: 'user',
    };
    return [JSON.stringify(animal), 'Success'];
}
function JsonIsValidAnimal(jsonObject) {
    // Check for required top-level fields
    const requiredFields = ['name', 'sciName', 'description', 'images', 'events'];
    for (const field of requiredFields) {
        if (!(field in jsonObject))
            return [false, { error: `invalid ${field}: must exist` }];
    }
    // name must be a non-empty string
    if (typeof jsonObject.name !== 'string' || jsonObject.name.trim().length < 1) {
        return [false, { error: 'invalid name: must have a length of at least 1' }];
    }
    // sciName must be a non-empty string
    if (typeof jsonObject.sciName !== 'string' || jsonObject.sciName.trim().length < 1) {
        return [false, { error: 'invalid sciName: must have a length of at least 1' }];
    }
    // description must be an array with at least 2 items
    if (!Array.isArray(jsonObject.description) || jsonObject.description.length < 2) {
        return [false, { error: 'invalid description: must contain at least 2 items' }];
    }
    // images must be a non-empty array
    if (!Array.isArray(jsonObject.images) || jsonObject.images.length < 1) {
        return [false, { error: 'invalid images: must not be empty' }];
    }
    // events must be a non-empty array
    if (!Array.isArray(jsonObject.events) || jsonObject.events.length < 1) {
        return [false, { error: 'invalid events: must not be empty' }];
    }
    // Regex to validate mm/dd/yyyy format
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    // Validate each event
    for (const event of jsonObject.events) {
        // Validate 'name'
        if (!('name' in event) || typeof event.name !== 'string' || event.name.trim().length < 1) {
            return [false, { error: 'invalid event: must contain a name' }];
        }
        // Validate 'date'
        if (!('date' in event) || typeof event.date !== 'string' || !dateRegex.test(event.date)) {
            return [false, { error: 'invalid event: must contain a date in the format mm/dd/yyyy' }];
        }
        // Validate 'url'
        if (!('url' in event) || typeof event.url !== 'string' || event.url.trim().length < 1) {
            return [false, { error: 'invalid event: must contain a url' }];
        }
    }
    return [true, null];
}
const sampleAnimalEvent1 = {
    name: 'Phoenix Phonetics',
    date: '12/24/2021',
    url: 'https://wearephoenix.com'
};
const sampleAnimalEvent2 = {
    name: 'Flight Pattern Anylyzation',
    date: '11/18/2025',
    url: 'https://www.phoenix.edu'
};
const sampleAnimal = {
    id: '1',
    name: 'Pheonix',
    sciName: "Offus Hekollous",
    description: ['The pheonix is a unique bird known for its ability to regenerate itself from its own ashes',
        'Although there have been no confirmed sightings, some claim that its raririty does not imply nonexistence.'],
    images: ['https://shmulif.github.io/animal-images/phoenix/phoenix1.jpg',
        'https://shmulif.github.io/animal-images/phoenix/phoenix2.webp'],
    video: 'https://www.youtube.com/watch?v=hTi_4lGQHq8',
    events: [sampleAnimalEvent1, sampleAnimalEvent2],
    createdByUser: 'johnhiggins32'
};
function formatSampleAnimal() {
    const result = `<form id="form" class="form" onsubmit="submitForm(event)">

        <label for="name">Name:</label>
        <input id="name" type="text" value="${sampleAnimal.name}">

        <label for="sciName">Scientific Name:</label>
        <input id="sciName" type="text" value="${sampleAnimal.sciName}">

        <label for="description">Description:</label>
        <textarea id="description" class="text-area" cols="40" rows="5">${newlineBetweenItems(sampleAnimal.description)}</textarea>

        <label for="images">Images:</label>
        <textarea id="images" class="text-area" cols="40" rows="5">${newlineBetweenItems(sampleAnimal.images)}</textarea>

        <label for="video">Video:</label>
        <input id="video" type="text" value="${sampleAnimal.video}">

        <label for="events">Events:</label>
        <textarea id="events" class="text-area" cols="40" rows="5">${formatAnimalEvents(sampleAnimal.events)}</textarea>

        <button type="submit">Submit</button>
        <div id="error-message"></div>
        <button onclick="loadSampleData()">Load Sample Data</button>

    </form>`;
    return result;
}
function formatAnimalEvents(events) {
    let result = '';
    for (const event of events) {
        result += `${event.name}\n${event.date}\n${event.url}\n`;
    }
    return result;
}
function newlineBetweenItems(items) {
    let result = '';
    for (const item of items) {
        result += `${item}\n`;
    }
    return result;
}
