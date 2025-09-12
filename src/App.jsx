import { useState, useEffect } from 'react';
import './App.css'

function App() {
  const [city, setCity] = useState('');
  const [displayName, setDisplayName] = useState('Welcome');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const API_KEY = 'a020c8b4fab16c5ecce5b73dbb4681e8'; 

  const fetchWeatherData = async (cityName) => {
    try {
      let response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      let data = await response.json();
      if (data.cod !== 200) {
        throw new Error(data.message || 'City not found');
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  const fetchForecastData = async (cityName) => {
    try {
      let response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      let data = await response.json();
      if (data.cod !== '200') {
        throw new Error('Forecast not available');
      }
      // pick every 8th item to get roughly daily forecasts
      const daily = data.list.filter((item, idx) => idx % 8 === 0).slice(0, 6);
      return daily;
    } catch (err) {
      throw err;
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setDisplayName(city);

    try {
      const weatherData = await fetchWeatherData(city);
      setWeather(weatherData);

      const forecastData = await fetchForecastData(city);
      setForecast(forecastData);
    } catch (err) {
      setWeather(null);
      setForecast([]);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
      setCity('');
    }
  };

  const handleLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLoading(true);
        setErrorMsg('');
        const { latitude, longitude } = pos.coords;
        try {
          let response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );
          let data = await response.json();
          if (data.cod !== 200) throw new Error('Unable to get weather for your location');
          setWeather(data);
          setDisplayName(data.name);

          let forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );
          let forecastData = await forecastResponse.json();
          if (forecastData.cod !== '200') throw new Error('Forecast not available');
          const daily = forecastData.list.filter((item, idx) => idx % 8 === 0).slice(0, 6);
          setForecast(daily);
        } catch (err) {
          setWeather(null);
          setForecast([]);
          setErrorMsg(err.message);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setErrorMsg('Geolocation permission denied');
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 md:p-10 space-y-6">
        {/* Header / Title */}
        <h1 className="text-3xl font-bold text-center text-white bg-blue-600 bg-opacity-80 rounded-lg p-4 shadow-md">
          Weather 🌤️
        </h1>

        {/* Search & Location */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            onClick={handleLocation}
            disabled={loading}
          >
            Use My Location
          </button>
        </form>

        {/* Display error message */}
        {errorMsg && (
          <div className="text-red-500 text-center">
            {errorMsg}
          </div>
        )}

        {/* Weather Info */}
        {weather && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="text-5xl font-bold text-gray-900">
                {Math.round(weather.main.temp)}°C
              </div>
              <div className="text-lg text-gray-700">
                {displayName}, {weather.sys.country}
              </div>
              <div className="capitalize text-gray-600">
                {weather.weather[0].description}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="bg-blue-100 bg-opacity-50 rounded-xl p-4 flex flex-col items-center">
                <span className="text-sm text-gray-600">Humidity</span>
                <span className="font-semibold text-gray-800">{weather.main.humidity}%</span>
              </div>
              <div className="bg-blue-100 bg-opacity-50 rounded-xl p-4 flex flex-col items-center">
                <span className="text-sm text-gray-600">Wind Speed</span>
                <span className="font-semibold text-gray-800">{weather.wind.speed} m/s</span>
              </div>
              <div className="bg-blue-100 bg-opacity-50 rounded-xl p-4 flex flex-col items-center">
                <span className="text-sm text-gray-600">Feels Like</span>
                <span className="font-semibold text-gray-800">{Math.round(weather.main.feels_like)}°C</span>
              </div>
            </div>
          </div>
        )}

        {/* Forecast */}
        {forecast.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">6‑Day Forecast</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {forecast.map((item, idx) => {
                const date = new Date(item.dt * 1000);
                return (
                  <div key={idx} className="bg-white bg-opacity-80 rounded-xl p-3 flex flex-col items-center shadow">
                    <div className="text-sm text-gray-600">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <img
                      src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                      alt={item.weather[0].description}
                      className="w-12 h-12"
                    />
                    <div className="capitalize text-gray-700 text-sm">{item.weather[0].main}</div>
                    <div className="font-semibold text-lg">{Math.round(item.main.temp)}°</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
