import { useState } from 'react';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [cityName, setName] = useState('Welcome');
  const [result, setResult] = useState({});
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);

  const getCity = (e) => {
    setCity(e.target.value);
  };

  async function fetchData(e) {
    e.preventDefault();
    if (!city) return;

    setLoading(true);
    setName(city);

    const token = 'a020c8b4fab16c5ecce5b73dbb4681e8';
    try {
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

      let forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${token}&units=metric`
      );
      let forecastData = await forecastResponse.json();

      if (forecastData.cod === '200') {
        const dailyForecast = forecastData.list.filter((item, index) => index % 8 === 0);
        setForecast(dailyForecast.slice(0, 6)); 
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
          setName(data.name); 
        } else {
          alert('Unable to get weather data for your location.');
        }

        let forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${token}&units=metric`
        );
        let forecastData = await forecastResponse.json();

        if (forecastData.cod === '200') {
          const dailyForecast = forecastData.list.filter((item, index) => index % 8 === 0);
          setForecast(dailyForecast.slice(0, 6)); 
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
          <span className="temp-text">{result.main ? result.main.temp + '°C' : '--°C'}</span>
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

      <hr className={result.main ? 'ruler' : 'none'} />

      <div className="week-forecast">
        {forecast.length > 0 &&
          forecast.map((item, index) => {
            const date = new Date(item.dt * 1000);
            return (
              <div className="col" key={index}>
                <h3 className="day-name">{date.toLocaleDateString('en-US', { weekday: 'short' })}</h3>
                <img
                  src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                  alt={item.weather[0].description}
                  style={{ width: '42px', height: '42px' }}
                />
                <p className="weather">{item.weather[0].main}</p>
                <span className="weather">{Math.round(item.main.temp)}°</span>
              </div>
            );
          })}
      </div>

      <div className="dev-box">
        <p className="dev-text">
          Designed and coded by 👉
          <a href="https://github.com/yrj03" target="_blank" className="git-link">
            Yuvraj
          </a>
          <span>👨‍💻</span>
        </p>
      </div>
    </div>
  );
}

export default App;
