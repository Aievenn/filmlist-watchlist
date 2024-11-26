// Global DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const movieSearchArea = document.getElementById('movie-search-area');
const toggleSwitch = document.querySelector(
  '.theme-switch input[type="checkbox"]'
);
const currentTheme = localStorage.getItem('theme');

// Initialize Theme
let theme = currentTheme === 'color' ? 'color' : 'mono';

if (currentTheme) {
  document.documentElement.setAttribute('data-theme', currentTheme);
  toggleSwitch.checked = theme === 'color';
}

// Toggle Theme
function switchTheme(e) {
  theme = e.target.checked ? 'color' : 'mono';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  location.reload();
}
toggleSwitch.addEventListener('change', switchTheme);

// Attach Enter Key to Search Button
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchBtn.click();
});
searchBtn.addEventListener('click', movieSearch);

// Fetch Top-Rated Movies
async function fetchMovies() {
  await renderMovies(
    'https://moviesdatabase.p.rapidapi.com/titles/random?list=top_rated_series_250',
    true
  );
}
fetchMovies();

// Handle Movie Search
async function movieSearch() {
  const query = searchInput.value.trim();
  searchInput.value = ''; // Clear input
  if (!query) return;
  const url = `http://www.omdbapi.com/?apikey=e265180&s=${query}`;
  await renderMovies(url);
}

// Render Movies (Reusable Function)
async function renderMovies(apiUrl, isTopRated = false) {
  movieSearchArea.innerHTML = '<div class="spinner"></div>';
  const watchListArray = JSON.parse(localStorage.getItem('watchList')) || [];
  const movieArray = [];
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': 'zgRV7dGdvXmsh5OqBfc5QRdlJurRp1LAcYnjsnjkKZPFsw1MmH',
      'x-rapidapi-host': 'moviesdatabase.p.rapidapi.com',
    },
  };

  try {
    const response = isTopRated
      ? await fetch(apiUrl, options)
      : await fetch(apiUrl);
    const data = isTopRated
      ? (await response.json()).results
      : (await response.json()).Search;
    if (!data) throw new Error('No results found');

    // Fetch additional OMDB details for top-rated movies
    const movies = isTopRated
      ? await Promise.all(
          data.map((movie) =>
            fetch(`http://www.omdbapi.com/?apikey=e265180&i=${movie.id}`).then(
              (res) => res.json()
            )
          )
        )
      : data;

    // Build Movie Cards
    movies.forEach((movie) => {
      const isInWatchlist = watchListArray.some(
        (item) => item.imdbID === movie.imdbID
      );
      movieArray.push(createMovieCard(movie, isInWatchlist));
    });

    movieSearchArea.innerHTML = movieArray.join('');
    if (theme === 'color') applyVibrantColors();
    attachWatchlistListeners();
  } catch (error) {
    console.error('Error rendering movies:', error);
    movieSearchArea.innerHTML =
      '<p>Error fetching movies. Please try again.</p>';
  }
}

// Create Movie Card
function createMovieCard(movie, isInWatchlist) {
  return `
    <div class="container">
      <div class="movie-element">
        <img class="movie-poster" src="${
          movie.Poster !== 'N/A' ? movie.Poster : '/img/no-img.png'
        }" 
          alt="Movie Poster" crossorigin="anonymous">

        <div class="movie-text">
          <p class="movie-title">${movie.Title || 'Unknown Title'}</p>
          <div class="series-year">
            <p class="movie-series">${movie.Type || 'N/A'}‎  • ‎  </p>
            <p class="movie-year">${movie.Year || 'Unknown Year'}</p>
          </div>
        </div>
        
        <div class="movie-buttons">
          <button class="watchlist-add" data-id="${movie.imdbID}">
            ${
              isInWatchlist
                ? '<img src="icon/check_circle_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg" alt=""> ADDED'
                : '<img src="icon/add_circle_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg" alt=""> WATCHLIST'
            }
          </button>
          <a href="https://www.imdb.com/title/${movie.imdbID}" 
             target="_blank" class="imdb-visit"><img src="icon/arrow_right_alt_24dp_D9D9D9_FILL0_wght400_GRAD0_opsz24.svg" alt="">SEE ON IMDB</a>
        </div>
      </div>
    </div>`;
}

// Apply Vibrant.js for Color Theme
function applyVibrantColors() {
  const posters = document.querySelectorAll('.movie-poster');
  posters.forEach((poster) => {
    const parent = poster.closest('.movie-element');
    const textElement = parent.querySelector('.movie-text');
    const buttonElement = parent.querySelector('.movie-buttons');

    poster.onload = () => {
      new Vibrant(poster)
        .getPalette()
        .then((palette) => {
          if (palette.Vibrant) {
            const vibrant = palette.Vibrant.getRgb();
            const muted = palette.DarkMuted.getRgb();
            textElement.style.background = `linear-gradient(0deg, rgba(${vibrant.join(
              ','
            )}, 1) 56%, rgba(16, 35, 66, 0) 100%)`;
            buttonElement.style.backgroundColor = `rgb(${muted.join(',')})`;
          }
        })
        .catch((error) => console.error('Error with Vibrant.js:', error));
    };
  });
}

// Attach Watchlist Listeners
function attachWatchlistListeners() {
  document.querySelectorAll('.watchlist-add').forEach((button) => {
    button.addEventListener('click', () => {
      const watchListArray =
        JSON.parse(localStorage.getItem('watchList')) || [];
      const movieID = button.dataset.id;

      if (!watchListArray.some((item) => item.imdbID === movieID)) {
        const movieDetails = {
          imdbID: movieID,
          html: button.closest('.container').innerHTML,
        };

        watchListArray.unshift(movieDetails);
        localStorage.setItem('watchList', JSON.stringify(watchListArray));

        button.innerHTML =
          '<img src="icon/check_circle_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg" alt=""> ADDED';
      }
    });
  });
}
