let store = {
    selectedRoverData: null,
    selectedRover: null,
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
    selectedRoverInfosLayout: 'list'
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
            <a href="#" id="changeLayoutButton">Change rover data informations layout</a>
            <section>
                <h3>Choose a rover to get its infomations and most recent photos </h3>
                <div class="rovers">
                    ${RenderRovers(store)}
                </div>
                <div class="selected-rover">
                   ${store.selectedRover ? RenderSelectedRover(store, store.selectedRoverInfosLayout === 'list' ? renderRoverInfosAsList: renderRoverInfosAsTable): ''}
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
    document.querySelector('#changeLayoutButton').addEventListener('click', changeLayout);
}

const changeLayout = e => {
    e.preventDefault();
    updateStore({selectedRoverInfosLayout: store.selectedRoverInfosLayout === 'list' ? 'table': 'list'});
};

//HOC which can be used to render data differently
const RenderSelectedRover = (state, roverInformationsRenderFunction) => {
    if (!state.selectedRoverData) {
        getRoverDataFromAPI(state);
        return `<p>Loading selected rover data</p>`;
    }
    else {
        return `
            <div class="selected-rover">
                <h3>Selected rover data</h3>
                ${roverInformationsRenderFunction(state.selectedRoverData.get(0), renderRoverInfosAsList)}
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

const RenderRovers = (state) => {
    return arrayToHTML(state.rovers, rover => {
        return `
            <div class="rover" data-rover-id="${rover.toLowerCase()}">
                <img class="rover__image" src="./${rover.toLowerCase()}.jpeg" alt="">
                <h3 class="rover__name">${rover}</h3>
            </div>
        `;
    });
}

// HOC to map data to HTML
const arrayToHTML = (array, mapCallback) => {
    return array.map(item => mapCallback(item)).join(' ');
}

const renderRoverInfosAsList = (firstPhoto) => {
    return `
        <ul class="selected-rover__infos">
            <li>Name: ${firstPhoto.rover.name}</li>
            <li>Launch Date: ${firstPhoto.rover.launch_date}</li>
            <li>Landing Date: ${firstPhoto.rover.landing_date}</li>
            <li>Status: ${firstPhoto.rover.status}</li>
            <li>Last photos date: ${firstPhoto.earth_date}</li>
        </ul>
    `;
}

const renderRoverInfosAsTable = (firstPhoto) => {
    return `
        <table>
            <tbody>
                <tr>
                    <td>${firstPhoto.rover.name}</td>
                    <td>${firstPhoto.rover.launch_date}</td>
                    <td>${firstPhoto.rover.landing_date}</td>
                    <td>${firstPhoto.rover.status}</td>
                    <td>${firstPhoto.earth_date}</td>
                </tr>
            </tbody>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Launch Date</th>
                    <th>Landing Date</th>
                    <th>Status</th>
                    <th>Last photos date</th>
                </tr>
            </thead>
        </table>
    `;
}

const getRoverDataFromAPI = (state) => {
    fetch(`http://localhost:3000/${state.selectedRover}`)
        .then(res => res.json())
        .then(({ data }) => {
            const roverData = data.latest_photos || data.photos;
            updateStore({ selectedRoverData: Immutable.List(roverData) })
        });
}