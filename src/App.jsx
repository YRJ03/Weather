import { useState } from 'react';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [displayName, setDisplayName] = useState('Welcome');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const API_KEY = 'a020c8b4fab16c5ecce5b73dbb4681e8';

  const fetchWeatherData = async (cityName) => {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    if (data.cod !== 200) throw new Error(data.message || 'City not found');
    return data;
  };

  const fetchForecastData = async (cityName) => {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    if (data.cod !== '200') throw new Error('Forecast not available');
    const daily = data.list.filter((_, idx) => idx % 8 === 0).slice(0, 6);
    return daily;
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

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setLoading(true);
      setErrorMsg('');
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        if (data.cod !== 200) throw new Error('Unable to get location weather');
        setWeather(data);
        setDisplayName(data.name);

        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
        );
        const forecastData = await forecastResponse.json();
        const daily = forecastData.list.filter((_, idx) => idx % 8 === 0).slice(0, 6);
        setForecast(daily);
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="app">
      <div className="weather-container">
        <h1 className="title">Weather Forecast 🌤️</h1>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button type="submit" className="btn search-btn" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button type="button" className="btn location-btn" onClick={handleLocation} disabled={loading}>
            📍 My Location
          </button>
        </form>

        {errorMsg && <p className="error">{errorMsg}</p>}

        {weather && (
          <div className="weather-card">
            <h2 className="city">
              {displayName}, {weather.sys.country}
            </h2>
            <div className="temp">{Math.round(weather.main.temp)}°C</div>
            <p className="desc">{weather.weather[0].description}</p>

            <div className="details">
              <div className="detail-box">
                <span>Humidity</span>
                <strong>{weather.main.humidity}%</strong>
              </div>
              <div className="detail-box">
                <span>Wind</span>
                <strong>{weather.wind.speed} m/s</strong>
              </div>
              <div className="detail-box">
                <span>Feels Like</span>
                <strong>{Math.round(weather.main.feels_like)}°C</strong>
              </div>
            </div>
          </div>
        )}

        {forecast.length > 0 && (
          <div className="forecast">
            <h3>6-Day Forecast</h3>
            <div className="forecast-grid">
              {forecast.map((item, idx) => {
                const date = new Date(item.dt * 1000);
                return (
                  <div key={idx} className="forecast-box">
                    <span className="day">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <img
                      src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                      alt={item.weather[0].description}
                    />
                    <p>{item.weather[0].main}</p>
                    <strong>{Math.round(item.main.temp)}°</strong>
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
