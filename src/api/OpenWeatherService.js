const GEO_API_URL = 'https://wft-geo-db.p.rapidapi.com/v1/geo';

const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';
const WEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY || '';

const GEO_API_OPTIONS = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': '4f0dcce84bmshac9e329bd55fd14p17ec6fjsnff18c2e61917',
    'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
  },
};

function getErrorMessage(response, fallbackMessage) {
  if (!response) {
    return fallbackMessage;
  }

  return response.message || fallbackMessage;
}

function ensureWeatherApiKey() {
  if (!WEATHER_API_KEY) {
    throw new Error(
      'Missing OpenWeather API key. Set REACT_APP_OPENWEATHER_API_KEY before searching.'
    );
  }
}

export async function fetchWeatherData(lat, lon) {
  ensureWeatherApiKey();

  try {
    const [weatherPromise, forecastPromise] = await Promise.all([
      fetch(
        `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
      ),
      fetch(
        `${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
      ),
    ]);

    const weatherResponse = await weatherPromise.json();
    const forecastResponse = await forecastPromise.json();

    if (!weatherPromise.ok) {
      throw new Error(
        getErrorMessage(weatherResponse, 'Unable to fetch current weather data.')
      );
    }

    if (!forecastPromise.ok) {
      throw new Error(
        getErrorMessage(forecastResponse, 'Unable to fetch forecast data.')
      );
    }

    return [weatherResponse, forecastResponse];
  } catch (error) {
    throw error;
  }
}

export async function fetchCities(input) {
  if (!input?.trim()) {
    return [];
  }

  try {
    const response = await fetch(
      `${GEO_API_URL}/cities?minPopulation=10000&namePrefix=${input}`,
      GEO_API_OPTIONS
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(getErrorMessage(data, 'Unable to fetch city suggestions.'));
    }

    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    throw error;
  }
}
