import { getAdminUserProfile } from './api_requests.js';
formatAdminPage();
async function formatAdminPage() {
    const authToken = localStorage.getItem('authToken');
    // If for some reson there's no auth token redirect to login page
    if (authToken === null) {
        window.location.href = 'login.html';
        return;
    }
    const currentUser = await fetchCurrentUser(authToken);
    if (currentUser === undefined) {
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
        return;
    }
    const pageDisplay = document.getElementById("admin-details");
    // Check if the element exists before attempting to update it
    if (pageDisplay) {
        pageDisplay.innerHTML = createAdminPageLayout(currentUser);
    }
    else {
        console.error("Element with ID 'main-container' not found.");
    }
}
async function fetchCurrentUser(authToken) {
    try {
        const [response, result] = await getAdminUserProfile(authToken);
        // Handle HTTP error responses
        if (response === 401) {
            alert('Unauthorized: Credentials are invalid or have expired. Please login again.');
            return;
        }
        else if (response === 404) {
            alert('User not found: Please login again.');
            return;
        }
        else if (response === 400) {
            alert(`Bad request: ${result?.error ?? 'Unknown error'}`);
            return;
        }
        else if (response === 500) {
            alert(`Server error: ${result?.error ?? 'Internal server error'}`);
            return;
        }
        // Validate that the result is a user object
        if (!result || typeof result !== 'object' || !('name' in result) || !('animals' in result)) {
            throw new Error(`Invalid user object received: ${JSON.stringify(result)}`);
        }
        // Safely cast the result to User type
        return result;
    }
    catch (error) {
        // Narrow down the error type before accessing its message
        if (error instanceof Error) {
            console.error('Error fetching current user:', error.message);
            alert(error.message);
        }
        else {
            console.error('An unknown error occurred:', error);
            alert('An unexpected error occurred. Please try again.');
        }
        // Redirect to login page
        window.location.href = 'login.html';
        throw error;
    }
}
function createAdminPageLayout(user) {
    let display = '';
    display +=
        `<div class="admin-details">
        <h2 id="title" class="title-heading">Hello ${user.name}!</h2>
        <div class="animal-list">
            <h3 id="about" class="about-label">Here are the animals you've added:</h3>
            ${formatAnimals(user.animals)}
        </div>
    </div>
    <div>
        <a href="create.html">Create an animal</a>
        <button onclick="logOut()">Log Out</button>
    </div>`;
    return display;
}
function formatAnimals(animals) {
    let result = '<ul>';
    for (const animal of animals) {
        result += `<li>${animal.name} (id: ${animal.id})</li>`;
    }
    result += '</ul>';
    return result;
}
window.logOut = function () {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
};
