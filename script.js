
const key = 'dbd3b02d8958d62185d02e944cd5f522';

window.onload = function () {
    // Get the user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                // Use reverse geocoding to get the city name from the coordinates
                const reverseGeocodingUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${key}`;

                fetch(reverseGeocodingUrl)
                    .then(response => response.json())
                    .then(data => {
                        const city = data[0].name;

                        // Call the searchCity function with the current location
                        searchCity(city);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            },
            function (error) {
                console.error('Error getting current position:', error);
            }
        );
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
};

function searchCity(city) {
    if (!city) {
        city = document.getElementById('city').value;
    }
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${key}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=${key}`;

    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => {
            // Display the current weather data
            const weatherData = data.weather[0];
            const weatherDescription = weatherData.description;
            const temperature = data.main.temp;
            const humidity = data.main.humidity;
            const windSpeed = data.wind.speed;

            const currentWeather = document.getElementById('currentWeather');
            const cityName = city || data.name;
            const currentDate = new Date().toLocaleDateString();

            currentWeather.innerHTML = `
                <h2>${cityName} (${currentDate})</h2>${weatherDescription}
                <p>Temp: ${temperature} K</p>
                  <p>Wind: ${windSpeed} m/s</p>
                <p>Humidity: ${humidity}%</p>
                
              `;

            // Save the city to the search history
            let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
            if (!history.includes(city)) {
                history.push(city);
                localStorage.setItem('searchHistory', JSON.stringify(history));
            }

            // Display the search history
            displaySearchHistory();
        })
        .catch(error => {
            console.error('Error:', error);
        });

    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            // Display the forecast data
            const forecastData = data.list;
            const forecastContainer = document.getElementById('forecast');
            forecastContainer.innerHTML = '';

            // Limit the forecast entries to 5
            const limitedForecastData = forecastData.slice(0, 5);

            // Create forecast items for each entry
            limitedForecastData.forEach(forecast => {
               const forecastDateTime = forecast.dt_txt;
               const weatherData = forecast.weather[0];
               const weatherDescription = weatherData.description;
               const temperature = forecast.main.temp;
               const humidity = forecast.main.humidity;
               const windSpeed = forecast.wind.speed;

               const forecastItem = document.createElement('div');
               forecastItem.classList.add('card', 'mb-3', 'col-md-2');
               forecastItem.innerHTML = `
                   <div class="card-body">
                       <p>${forecastDateTime}</p>
                       ${weatherDescription}
                       <p>Temp: ${temperature} K</p>
                       <p>Wind: ${windSpeed} m/s</p>
                       <p>Humidity: ${humidity}%</p>
                   </div>
               `;

               forecastContainer.appendChild(forecastItem);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


function removeCity(city) {
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    const index = history.indexOf(city);
    if (index !== -1) {
        history.splice(index, 1);
        localStorage.setItem('searchHistory', JSON.stringify(history));
        displaySearchHistory();
    }
}

function displaySearchHistory() {
    const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    const historyContainer = document.getElementById('searchHistory');

    // Clear the current display
    historyContainer.innerHTML = '';

    // Create a new list item for each city in the search history
    history.forEach(city => {
        const listItem = document.createElement('li');

        // Create an anchor tag to search the city
        const anchor = document.createElement('a');
        anchor.href = '#';
        anchor.textContent = city;
        anchor.addEventListener('click', () => {
            searchCity(city);
        });

        // Create a button element to remove the city
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
            removeCity(city);
        });

        // Append the anchor tag and remove button to the list item
        listItem.appendChild(anchor);
        listItem.appendChild(removeButton);

        // Append the list item to the history container
        historyContainer.appendChild(listItem);
    });
}

// Display the search history when the page loads
window.onload = displaySearchHistory;
