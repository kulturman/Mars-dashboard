let store = {
    selectedRoverData: null,
    selectedRover: null,
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state);
    attachEvents();
}


// create content
const App = (state) => {
    let { rovers, apod } = state

    return `
        <header>
            <h1 class="main-title">Mars dashboard</h1>
        </header>
        <main>
            <section>
                <h3>Choose a rover to get its infomations and most recent photos </h3>
                <div class="rovers">
                    ${RenderRovers(store)}
                </div>
                <div class="selected-rover">
                    ${RenderSelectedRover(store)}
                </div>
            </section>
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store);
})

const attachEvents = () => {
    document.querySelector('.rovers').addEventListener('click', selectRover);
}

const RenderSelectedRover = state => {
    if (state.selectedRover && !state.selectedRoverData) {
        getRoverDataFromAPI(state);
    }

    return '';
}

const selectRover = event => {
    const roverDivElement = event.target.closest('.rover');

    if (roverDivElement !== null) {
        const selectedRover = roverDivElement.dataset.roverId;
        updateStore({ selectedRover, selectedRoverData: null });
    }
}

const RenderRovers = state => {
    return state.rovers.map(rover => {
        return `
            <div class="rover" data-rover-id="${rover.toLowerCase()}">
                <img class="rover__image" src="./${rover.toLowerCase()}.jpeg" alt="">
                <h3 class="rover__name">${rover}</h3>
            </div>
        `
    }).join('');
}


// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(store)
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}


const getRoverDataFromAPI = (state) => {
    fetch(`http://localhost:3000/${state.selectedRover}`)
        .then(res => res.json())
        .then(({ data }) => updateStore({ selectedRoverData: data.latest_photos }))
}