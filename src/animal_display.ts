    import { fetchOneAnimal } from './api_requests.js'
    import { Artwork, AnimalEvent } from './interfaces.js'


    formatAnimalDisplayPage()


    async function formatAnimalDisplayPage(): Promise<void> {

        const id: string = getCurrentAnimalId()

        const currentAnimal: Artwork = await fetchCurrentAnimal(id)

        updatePageTitle(currentAnimal.name)

        const pageDisplay = document.getElementById("main-container")
        
         // Check if the element exists before attempting to update it
        if (pageDisplay) {
            // Wait for the asynchronous function to complete
            pageDisplay.innerHTML = createAnimalDisplay(currentAnimal)
        } else {
            console.error("Element with ID 'main-container' not found.")
        }
    
    }

    function getCurrentAnimalId(): string {
        // Get the URL parameters
        const urlParams: URLSearchParams = new URLSearchParams(window.location.search)
        const id: string | null | undefined = urlParams.get('id')
    
        if (id === null || id === undefined){
            console.log('ID is null')
            window.location.href = 'index.html'
        }
    
        return id!
    }

    async function fetchCurrentAnimal(id: string){
        
        const [response, result]: [number, Artwork] = await fetchOneAnimal(id!)

        if (response === 404 || response === 500) {
            window.location.href = 'index.html'
        }
        
        return result
    }

    function createAnimalDisplay(animal: Artwork): string {
        
        let display = ''
        
        display +=
       `<h1 id="title" class="title-heading">${animal.name}</h1>
        <img class="title-image" src="${animal.image}" alt="images/placeholder.svg">
        <h2 id="about" class="about-label">About</h2>

        ${formatDescription(animal.description)}`


        return display
    }
    
    function formatDescription(description: string[]): string {

        let formattedDescription = ''

        for (const paragraph of description){
            formattedDescription += `<p class="about-paragraph">${paragraph}</p>`
        }

        return formattedDescription

    }


function updatePageTitle(newTitle: string): void {

    const title: HTMLElement | null = document.getElementById("title")

    // Check if the element exists before attempting to update it
    if (title) {
        // Wait for the asynchronous function to complete
        title.innerHTML = newTitle
    } else {
        console.error("Element with ID 'title' not found.")
    }


}

