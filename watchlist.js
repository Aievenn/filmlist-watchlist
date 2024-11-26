const watchlistContainer = document.getElementById('watchlist-container');

// Fetch watchlist from localStorage
let watchListArray = JSON.parse(window.localStorage.getItem('watchList')) || [];

// Check if watchlist is empty
if (watchListArray.length === 0) {
  watchlistContainer.innerHTML = `<p class='watchlist-empty'>Your watchlist is empty.</p>`;
} else {
  // Render each movie in the watchlist
  watchListArray.forEach((movie) => {
    const movieElement = document.createElement('div');
    movieElement.classList.add('container');
    movieElement.innerHTML = movie.html; // Using stored HTML from `movieSearch`

    // Update button to show "Added"
    const watchlistButton = movieElement.querySelector('.watchlist-add');
    if (watchlistButton) {
      watchlistButton.innerHTML =
        '<img src="/img/check_circle_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg" alt=""> Added';
      watchlistButton.disabled = true; // Disable the button to prevent further additions
    }

    // Add a "Remove" button
    const removeButton = document.createElement('button');
    removeButton.innerHTML =
      '<img src="icon/cancel_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg">REMOVE';
    removeButton.classList.add('remove-watchlist');
    removeButton.addEventListener('click', () => {
      removeFromWatchlist(movie.imdbID, movieElement);
    });

    movieElement.querySelector('.movie-buttons').appendChild(removeButton);
    watchlistContainer.appendChild(movieElement);
  });
}

// Remove movie from watchlist
function removeFromWatchlist(imdbID, movieElement) {
  // Update the watchListArray dynamically
  watchListArray = watchListArray.filter((item) => item.imdbID !== imdbID);

  // Update localStorage with the new array
  window.localStorage.setItem('watchList', JSON.stringify(watchListArray));

  // Remove the movie element from the DOM
  movieElement.remove();

  // Show empty message if no movies remain
  if (watchListArray.length === 0) {
    watchlistContainer.innerHTML = `<p class='watchlist-empty'>Your watchlist is empty.</p>`;
  }
}
