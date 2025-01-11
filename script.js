const apiKey = "3d2173e3a82f9b32a0aa37e31baaf0ce"; // Replace with your valid API key
const searchBtn = document.getElementById("searchBtn");
const currentLocationBtn = document.getElementById("currentLocationBtn");
const cityInput = document.getElementById("cityInput");
const recentCitiesDropdown = document.getElementById("recentCitiesDropdown");
const currentWeather = document.getElementById("currentWeather");
const forecastContainer = document.getElementById("forecast");
const forecastGrid = forecastContainer.querySelector(".grid");

// Save city to localStorage and update dropdown
function saveCityToLocalStorage(city) {
  let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (!recentCities.includes(city)) {
    recentCities.push(city);
    if (recentCities.length > 5) {
      recentCities.shift(); // Keep only the latest 5 cities
    }
    localStorage.setItem("recentCities", JSON.stringify(recentCities));
    updateRecentCitiesDropdown();
  }
}

// Update dropdown with recently searched cities
function updateRecentCitiesDropdown() {
  const recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
  recentCitiesDropdown.innerHTML = "";
  if (recentCities.length > 0) {
    recentCitiesDropdown.classList.remove("hidden");
    recentCities.forEach((city) => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      recentCitiesDropdown.appendChild(option);
    });
  } else {
    recentCitiesDropdown.classList.add("hidden");
  }
}

// Fetch weather data by city name
async function fetchWeather(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );

    if (!response.ok) throw new Error("City not found");

    const data = await response.json();
    displayCurrentWeather(data);

    // Fetch 5-day forecast
    fetchForecast(data.coord.lat, data.coord.lon);
  } catch (error) {
    alert(error.message);
  }
}

// Fetch 5-day forecast
async function fetchForecast(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );

    if (!response.ok) throw new Error("Failed to fetch forecast");

    const data = await response.json();
    displayForecast(data.list);
  } catch (error) {
    alert(error.message);
  }
}

// Get appropriate weather icon
function getWeatherIcon(condition) {
  const icons = {
    Clear: "fa-sun text-yellow-500",
    Clouds: "fa-cloud text-gray-500",
    Rain: "fa-cloud-showers-heavy text-blue-500",
    Thunderstorm: "fa-bolt text-yellow-600",
    Snow: "fa-snowflake text-blue-300",
    Drizzle: "fa-cloud-rain text-blue-400",
    Mist: "fa-smog text-gray-400",
  };
  return icons[condition] || "fa-question-circle text-gray-600"; // Default icon
}

// Display current weather
function displayCurrentWeather(data) {
  const currentDate = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const condition = data.weather && data.weather[0] ? data.weather[0].main : "Unknown";
  const iconClass = getWeatherIcon(condition);

  currentWeather.classList.remove("hidden");
  document.getElementById("cityName").textContent = `${data.name} (${currentDate})`;
  document.getElementById("temperature").textContent = `Temperature: ${data.main.temp}°C`;
  document.getElementById("wind").textContent = `Wind: ${data.wind.speed} m/s`;
  document.getElementById("humidity").textContent = `Humidity: ${data.main.humidity}%`;

  // Set weather icon and description
  document.getElementById("weatherIcon").className = `fas ${iconClass}`;
  document.getElementById("weatherText").textContent = data.weather[0].description;
}

// Display 5-day forecast
function displayForecast(forecast) {
  forecastContainer.classList.remove("hidden");
  forecastGrid.innerHTML = "";

  forecast.forEach((item, index) => {
    if (index % 8 === 0) {
      const forecastDate = new Date(item.dt_txt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const card = document.createElement("div");
      card.className = "bg-white p-4 rounded shadow text-center";
      card.innerHTML = `
        <h4 class="font-bold">${forecastDate}</h4>
        <p>${item.weather && item.weather[0] ? item.weather[0].description : "N/A"}</p>
        <p>Temp: ${item.main.temp}°C</p>
        <p>Wind: ${item.wind.speed} m/s</p>
        <p>Humidity: ${item.main.humidity}%</p>
      `;
      forecastGrid.appendChild(card);
    }
  });
}

// Fetch weather when a city is selected from the dropdown
recentCitiesDropdown.addEventListener("change", () => {
  const selectedCity = recentCitiesDropdown.value;
  if (selectedCity) {
    fetchWeather(selectedCity);
  }
});

// Event Listeners
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    saveCityToLocalStorage(city);
    fetchWeather(city);
  } else {
    alert("Please enter a city name");
  }
});

currentLocationBtn.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      fetchWeatherByCoordinates(position.coords.latitude, position.coords.longitude);
    },
    () => {
      alert("Unable to retrieve your location");
    }
  );
});

// Fetch weather by coordinates
async function fetchWeatherByCoordinates(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );

    if (!response.ok) throw new Error("Failed to fetch weather");

    const data = await response.json();
    displayCurrentWeather(data);

    // Fetch 5-day forecast
    fetchForecast(lat, lon);
  } catch (error) {
    alert(error.message);
  }
}

// Initialize dropdown on page load
document.addEventListener("DOMContentLoaded", updateRecentCitiesDropdown);
