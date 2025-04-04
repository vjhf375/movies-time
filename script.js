const API_KEY = '452f3f0bb0324f9ee7bbfe7019002146';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w92'; // छोटा पोस्टर आकार

let currentPage = 1;
let currentQuery = '';
const moviesPerPage = 30;

async function fetchMovies(page = 1, query = '') {
    let url = query
        ? `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
        : `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) { // जाँचें कि परिणाम मौजूद हैं या नहीं
            const movieDetails = await fetchMoviesDetailsBulk(data.results);
            displayMovies(movieDetails);
            updatePagination(page, data.total_pages);
        } else {
            displayNoMoviesFound(); // कोई मूवी नहीं मिलने पर संदेश प्रदर्शित करें
        }
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

async function fetchMoviesDetailsBulk(movies) {
    const promises = movies.map(movie =>
        fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}`).then(res => res.json())
    );
    return Promise.all(promises);
}

function updatePagination(page, totalPages) {
    currentPage = page;
    document.querySelector('.pagination').innerHTML = `
        <button class="page-btn" onclick="prevPage()" ${page === 1 ? 'disabled' : ''}>Previous</button>
        <span>Page ${page} of ${totalPages}</span>
        <button class="page-btn" onclick="nextPage()" ${page >= totalPages ? 'disabled' : ''}>Next Page</button>
    `;
}

function displayMovies(movies) {
    const movieList = document.getElementById('animeList');
    movieList.innerHTML = '';

    movies.forEach(movie => {
        const movieItem = document.createElement('div');
        movieItem.classList.add('anime-item');

        movieItem.innerHTML = `
            <img src="${movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : 'https://via.placeholder.com/500'}" alt="${movie.title}" onclick="redirectToDetails('${movie.id}')">
            <div class="anime-details">
                <h3>${movie.title}</h3>
                <p><strong> Language:</strong> ${movie.original_language.toUpperCase()}</p>
                 <p><strong> Genres:</strong> ${movie.genres.map(g => g.name).join(', ')}</p>
            </div>
        `;
        movieList.appendChild(movieItem);
    });
}

function displayNoMoviesFound() {
    const movieList = document.getElementById('animeList');
    movieList.innerHTML = '<p style="text-align: center;">Check Your Spelling</p>';
}

function redirectToDetails(movieId) {
    window.location.href = `movie-details.html?id=${movieId}`;
}

async function playMovie(movieId, imdbId) {
    const videoModal = document.getElementById('videoModal');
    const moviePlayer = document.getElementById('moviePlayer');

    const servers = [
        `https://vidsrc.to/embed/movie/${imdbId || movieId}`,
        `https://multiembed.mov/embed/${imdbId || movieId}`,
        `https://2embed.org/embed/${imdbId || movieId}`
    ];

    let videoSrc = servers.find(src => src);

    if (!videoSrc) {
        alert("Sorry, no working stream found for this movie.");
        return;
    }

    moviePlayer.src = videoSrc;
    videoModal.style.display = 'flex';
}

function closeVideo() {
    const videoModal = document.getElementById('videoModal');
    const moviePlayer = document.getElementById('moviePlayer');
    moviePlayer.src = '';
    videoModal.style.display = 'none';
}

function prevPage() {
    if (currentPage > 1) {
        fetchMovies(currentPage - 1, currentQuery);
    }
}

function nextPage() {
    fetchMovies(currentPage + 1, currentQuery);
}

function searchMovies() {
    const searchInput = document.getElementById('searchInput');
    currentQuery = searchInput.value.trim();
    currentPage = 1;
    fetchMovies(currentPage, currentQuery);
}

// खोज सुझाव कार्यक्षमता
const searchInput = document.getElementById('searchInput');
const resultsList = document.createElement('ul');
resultsList.id = 'searchResults';
resultsList.style.position = 'absolute';
resultsList.style.background = '#2a2a2a';
resultsList.style.color = 'white';
resultsList.style.width = '400px'; // सूची को चौड़ा करें
resultsList.style.zIndex = '10';
resultsList.style.display = 'none';

// खोज इनपुट के नीचे सुझाव सूची प्रदर्शित करने के लिए CSS
resultsList.style.top = searchInput.offsetTop + searchInput.offsetHeight + 'px';
resultsList.style.left = searchInput.offsetLeft + 'px';

searchInput.parentElement.appendChild(resultsList);

searchInput.addEventListener('input', async function() {
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchTerm)}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.results) {
                displaySuggestions(data.results.slice(0, 5)); // शीर्ष 5 सुझाव दिखाएँ
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    } else {
        resultsList.style.display = 'none';
    }
});

function displaySuggestions(suggestions) {
    resultsList.innerHTML = '';
    suggestions.forEach(movie => {
        const listItem = document.createElement('li');
        listItem.style.display = 'flex'; // लचीला लेआउट
        listItem.style.alignItems = 'center'; // ऊर्ध्वाधर संरेखण
        listItem.style.padding = '10px';
        listItem.style.cursor = 'pointer';

        const poster = document.createElement('img');
        poster.src = movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : 'https://via.placeholder.com/92x138';
        poster.alt = movie.title;
        poster.style.marginRight = '10px';

        const details = document.createElement('div');
        details.innerHTML = `
            <strong>${movie.title}</strong>
            <br>
            ${movie.release_date ? movie.release_date.substring(0, 4) : 'Unknown'}
        `;

        listItem.appendChild(poster);
        listItem.appendChild(details);

        listItem.addEventListener('click', function() {
            searchInput.value = movie.title;
            searchMovies();
            resultsList.style.display = 'none';
        });
        resultsList.appendChild(listItem);
    });
    resultsList.style.display = 'block';
}

searchInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        searchMovies();
        resultsList.style.display = 'none';
    }
});

fetchMovies();
