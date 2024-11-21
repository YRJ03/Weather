import { useState } from 'react';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [cityName, setName] = useState('Welcome');
  const [result, setResult] = useState([]);
  const [forecast, setForecast] = useState([]); // Store forecast data
  const [loading, setLoading] = useState(false);

  const getCity = (e) => {
    setCity(e.target.value);
  };

  async function fetchData(e) {
    e.preventDefault();
    if (!city) return; // Ensure city is provided

    setLoading(true);
    setName(city);

    const token = 'a020c8b4fab16c5ecce5b73dbb4681e8';
    try {
      // Fetch current weather data
      let response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${token}&units=metric`
      );
      let data = await response.json();

      if (data.cod === 200) {
        setResult(data);
      } else {
        alert('City not found!');
        setResult({});
      }

      // Fetch 5-day forecast data
      let forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${token}&units=metric`
      );
      let forecastData = await forecastResponse.json();

      if (forecastData.cod === '200') {
        const dailyForecast = forecastData.list.filter((item, index) => index % 8 === 0); // Get the first data of each day (every 8th item)
        setForecast(dailyForecast.slice(0, 6)); // Limit to 6 days (current + next 5 days)
      } else {
        alert('Error fetching forecast data');
        setForecast([]);
      }
    } catch (error) {
      console.error(error);
      alert('Error fetching data');
    } finally {
      setLoading(false);
      setCity('');
    }
  }

  // Get current location weather
  const getCurrentLocationWeather = () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      setLoading(true);

      const token = 'a020c8b4fab16c5ecce5b73dbb4681e8';
      try {
        let response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${token}&units=metric`
        );
        let data = await response.json();

        if (data.cod === 200) {
          setResult(data);
          setName(data.name); // Update city name to current location
        } else {
          alert('Unable to get weather data for your location.');
        }

        // Fetch 5-day forecast data
        let forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${token}&units=metric`
        );
        let forecastData = await forecastResponse.json();

        if (forecastData.cod === '200') {
          const dailyForecast = forecastData.list.filter((item, index) => index % 8 === 0); // Get the first data of each day (every 8th item)
          setForecast(dailyForecast.slice(0, 6)); // Limit to 6 days (current + next 5 days)
        } else {
          alert('Error fetching forecast data');
          setForecast([]);
        }
      } catch (error) {
        console.error(error);
        alert('Error fetching data');
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="container">
      <div className="input-box">
        <form className="input-form" onSubmit={fetchData}>
          <input
            type="text"
            onChange={getCity}
            placeholder="Enter Your City Name..."
            className="input"
            value={city}
          />
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Loading...' : 'Search'}
          </button>
        </form>
        <div>
          <button className="location-btn" onClick={getCurrentLocationWeather}>
            Current Location
          </button>
        </div>
        <span className="city-name">{cityName}</span>
      </div>
      <div className={result.main ? 'main-box' : 'none'}>
        <div className="box-one">
          {result.main ? (
            <span className="temp-text">{result.main.temp}°C</span>
          ) : (
            <span className="temp-text">--°C</span>
          )}
        </div>
        <div className="box-two">
          <span className="date-text">
            Date:{result.sys ? new Date(result.dt * 1000).toLocaleTimeString() : '--:--'}
          </span>
          <span className="day-text">
            Day:{result.sys ? new Date(result.dt * 1000).toLocaleString('en-US', { weekday: 'long' }) : '---'}
          </span>
          <span className="sky-text">
            Weather:{result.weather ? result.weather[0].main : '---'}
          </span>
        </div>
        <div className="box-three">
          <span className="humidity-text">
            Humidity:{result.main ? result.main.humidity : '--'}%
          </span>
          <span className="wind-text">
            Wind:{result.wind ? result.wind.speed : '--'} m/s
          </span>
        </div>
      </div>
      <hr className={result.main ? 'ruler' : 'none'}/>
      {/* Displaying 6-day forecast (current day + next 5 days) */}
      <div className="week-forecast">
        {forecast.length > 0 ? (
          forecast.map((item, index) => {
            const date = new Date(item.dt * 1000);
            return (
              <div className="col" key={index}>
                <h3 className='day-name'>{date.toLocaleDateString('en-US', { weekday: 'short' })}</h3>
                <br />
                <img
                  src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                  alt={item.weather[0].description}
                  style={{ width: '42px', height: '42px' }}
                />
                <br />
                <p className="weather">{item.weather[0].main}</p>
                <span className='weather'>{Math.round(item.main.temp)}°</span>
              </div>
            );
          })
        ) : (
          <p className={'error-msg'}>No data available.</p>
        )}
      </div>
      <div className='dev-box'>
        <p className='dev-text'>
          Designed and coded by👉
          <a href="https://github.com/yrj03" target="_blank" className='git-link'>Yuvraj</a
          ><span>👨‍💻</span>
        </p>
      </div>
    </div>
  );
}

export default App;
