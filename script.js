const API_KEY = '452f3f0bb0324f9ee7bbfe7019002146';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

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

        if (data.results) {
            const movieDetails = await fetchMoviesDetailsBulk(data.results);
            displayMovies(movieDetails);
            updatePagination(page, data.total_pages);
        } else {
            console.error('No movies found');
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
                <p><strong>⭐ Rating:</strong> ${movie.vote_average}</p>
                <p><strong> Release Date:</strong> ${movie.release_date}</p>
                <p><strong> Genres:</strong> ${movie.genres.map(g => g.name).join(', ')}</p>
                <p><strong>⏳ Duration:</strong> ${movie.runtime} min</p>
                <p><strong>️ Language:</strong> ${movie.original_language.toUpperCase()}</p>
            </div>
        `;

        movieList.appendChild(movieItem);
    });
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

window.playMovie = playMovie;
window.closeVideo = closeVideo;
window.prevPage = prevPage;
window.nextPage = nextPage;
window.redirectToDetails = redirectToDetails;
window.searchMovies = searchMovies;

fetchMovies();