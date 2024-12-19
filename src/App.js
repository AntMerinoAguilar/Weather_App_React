import React, { useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");

  const apiKey = "45c84d456100e6155ea020d988bfa464";

  const getWeather = async () => {
    if (!city) {
      setError("Veuillez entrer une ville.");
      setWeather(null);
      setForecast([]);
      return;
    }

    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=fr`
      );
      const weatherData  = await weatherResponse.json();

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=fr`
      );
      const forecastData = await forecastResponse.json();

      if (weatherData.cod === 200 && forecastData.cod === "200") {
        setWeather(weatherData);
        setError("");

        const dailyForecasts = forecastData.list.filter((item) =>
          item.dt_txt.includes('12:00:00')
        );
      } else {
        setError(`Erreur : ${data.message}`);
        setWeather(null);
      }
    } catch (err) {
      setError("Une erreur est survenue.");
      setWeather(null);
    }

    setCity("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      getWeather();
    }
  };

  const getBackgroundClass = () => {
    if (!weather) return "default-bg";
    const mainWeather = weather.weather[0].main.toLowerCase();

    if (mainWeather.includes("clear")) return "sunny-bg";
    if (mainWeather.includes("cloud")) return "cloudy-bg";
    if (mainWeather.includes("rain") || mainWeather.includes("drizzle"))
      return "rainy-bg";
    if (mainWeather.includes("thunderstorm")) return "stormy-bg";
    if (mainWeather.includes("snow")) return "snowy-bg";
    return "default-bg";
  };

  const getLocalTime = (timezone) => {
    const now = new Date();
    const utcOffset = now.getTimezoneOffset() * 60;
    const localTimestamp = now.getTime() / 1000 + timezone + utcOffset;
    const localDate = new Date(localTimestamp * 1000);
    return localDate.toLocaleString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`background ${getBackgroundClass()}`}>
      <div className="app">
        <h1>Application Météo</h1>
        <div className="search">
          <input
            type="text"
            placeholder="Entrez une ville"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button onClick={getWeather}>Obtenir la météo</button>
        </div>
        {error && <p className="error">{error}</p>}
        {weather && (
          <div className="weather-result">
            <h2>
              {weather.name}, {weather.sys.country}
            </h2>
            <img
              src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />
            <p>Température : {weather.main.temp}°C</p>
            <p>Température ressentie : {weather.main.feels_like}°C</p>
            <p>Météo : {weather.weather[0].description}</p>
            <p>Humidité : {weather.main.humidity}%</p>
            <p>Pression : {weather.main.pressure} hPa</p>
            <p>Vitesse du vent : {weather.wind.speed} m/s</p>
            <p>Nuages : {weather.clouds.all}%</p>
            <p>Date et heure locale : {getLocalTime(weather.timezone)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
