let store = {
    selectedRoverData: null,
    selectedRover: null,
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
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
                   ${store.selectedRover ? RenderSelectedRover(store): ''}
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
    if (!state.selectedRoverData) {
        getRoverDataFromAPI(state);
        return `<p>Loading selected rover data</p>`;
    }
    else {
        const currentRover = state.selectedRoverData.get(0).rover;
        return `
            <div class="selected-rover">
                <h3>Selected rover data</h3>
                <div class="selected-rover__infos">
                    <p>Name: ${currentRover.name}</p>
                    <p>Launch Date: ${currentRover.launch_date}</p>
                    <p>Landing Date: ${currentRover.landing_date}</p>
                    <p>Status: ${currentRover.status}</p>
                    <p>Photos taken on: ${state.selectedRoverData.get(0).earth_date}</p>
                </div>
                <div class="selected-rover__images">
                    ${arrayToHTML(state.selectedRoverData, data => {
                        return `
                            <div class="selected-rover__image">
                                <img src="${data.img_src}" alt="">
                            </div>
                        `
                    })}
                </div>
            </div>
        `
    }
}

const selectRover = event => {
    const roverDivElement = event.target.closest('.rover');

    if (roverDivElement !== null) {
        const selectedRover = roverDivElement.dataset.roverId;
        updateStore({ selectedRover, selectedRoverData: null });
    }
}

const RenderRovers = state => {
    return arrayToHTML(state.rovers, rover => {
        return `
            <div class="rover" data-rover-id="${rover.toLowerCase()}">
                <img class="rover__image" src="./${rover.toLowerCase()}.jpeg" alt="">
                <h3 class="rover__name">${rover}</h3>
            </div>
        `;
    });
}

const arrayToHTML = (array, mapCallback) => {
    return array.map(item => mapCallback(item)).join(' ');
}

const getRoverDataFromAPI = (state) => {
    fetch(`http://localhost:3000/${state.selectedRover}`)
        .then(res => res.json())
        .then(({ data }) => {
            const roverData = data.latest_photos || data.photos;
            updateStore({ selectedRoverData: Immutable.List(roverData) })
        });
}