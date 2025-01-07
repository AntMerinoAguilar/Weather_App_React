import React, { useState } from "react";
import "./App.css";

function App() {
  // ---STATE---
  const [city, setCity] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");

  const OPENWEATHERMAP_ACCESS_KEY =
    process.env.REACT_APP_OPENWEATHERMAP_ACCESS_KEY;

  const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;

  // ---COMPORTEMENTS---
  const getCityImage = async (city) => {
    const query = `${city} city landscape`;
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&client_id=${UNSPLASH_ACCESS_KEY}`
      );
      const data = await response.json();

      if (data && data.results && data.results.length > 0) {
        return data.results[0].urls.full;
      }
      return null;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'image : ", error);
      return null;
    }
  };

  const getWeather = async () => {
    if (!city) {
      setError("Veuillez entrer une ville.");
      setWeather(null);
      setForecast([]);
      setBackgroundImage("");
      return;
    }

    try {
      const weatherResponse = fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHERMAP_ACCESS_KEY}&units=metric&lang=fr`
      );

      const forecastResponse = fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${OPENWEATHERMAP_ACCESS_KEY}&units=metric&lang=fr`
      );

      const imagePromise = getCityImage(city);

      const [weatherData, forecastData, imageUrl] = await Promise.allSettled([
        weatherResponse,
        forecastResponse,
        imagePromise,
      ]);

      if (
        weatherData.status === "fulfilled" &&
        forecastData.status === "fulfilled"
      ) {
        const weatherJson = await weatherData.value.json();
        const forecastJson = await forecastData.value.json();

        if (weatherJson.cod === 200 && forecastJson.cod === "200") {
          setWeather(weatherJson);
          setError("");

          const dailyForecasts = forecastJson.list.filter((item) =>
            item.dt_txt.includes("12:00:00")
          );
          setForecast(dailyForecasts);

          if (imageUrl.status === "fulfilled" && imageUrl.value) {
            setBackgroundImage(imageUrl.value);
          } else {
            setBackgroundImage("");
          }
        } else {
          setError(`Erreur : ${weatherJson.message}`);
          setWeather(null);
          setForecast([]);
          setBackgroundImage("");
        }
      } else {
        setError("Erreur lors de la récupération des données météo.");
        setWeather(null);
        setForecast([]);
        setBackgroundImage("");
      }
    } catch (err) {
      setError("Une erreur est survenue.");
      setWeather(null);
      setForecast([]);
      setBackgroundImage("");
    }

    setCity("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      getWeather();
    }
  };

  const determineBackgroundClass = (mainWeather) => {
    if (mainWeather.includes("clear")) return "sunny-bg";
    if (mainWeather.includes("cloud")) return "cloudy-bg";
    if (mainWeather.includes("rain") || mainWeather.includes("drizzle"))
      return "rainy-bg";
    if (mainWeather.includes("thunderstorm")) return "stormy-bg";
    if (mainWeather.includes("snow")) return "snowy-bg";
    if (mainWeather.includes("mist")) return "mist-bg";
    if (mainWeather.includes("fog")) return "fog-bg";
    if (mainWeather.includes("smoke")) return "smoke-bg";
    if (mainWeather.includes("haze")) return "haze-bg";
    if (mainWeather.includes("dust")) return "dust-bg";
    if (mainWeather.includes("ash")) return "ash-bg";
    if (mainWeather.includes("squall")) return "squall-bg";
    if (mainWeather.includes("tornado")) return "tornado-bg";
    return "default-bg";
  };

  const getBackgroundClass = () => {
    if (!weather) return "default-bg";
    return determineBackgroundClass(weather.weather[0].main.toLowerCase());
  };

  const getBackgroundClassForecast = (forecastWeather) => {
    if (!forecastWeather) return "default-bg";
    return determineBackgroundClass(
      forecastWeather.weather[0].main.toLowerCase()
    );
  };

  const getLocalTime = (timezone) => {
    const now = new Date();
    const utcOffset = now.getTimezoneOffset() * 60;
    const localTimestamp = now.getTime() / 1000 + timezone + utcOffset;
    const localDate = new Date(localTimestamp * 1000);
    return localDate.toLocaleString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ---RENDER---
  return (
    <div
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="app">
        <div className="header">
          <h1>Application Météo</h1>

          <div className="search">
            <input
              type="text"
              placeholder="Entrez une ville"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={handleKeyPress}
              aria-label="Entrez le nom de votre ville"
            />
            <button onClick={getWeather} aria-label="Rechercher la météo">
              Obtenir la météo
            </button>
          </div>

          {error && <p className="error">{error}</p>}
        </div>

        <div className="main-content">
          {weather && (
            <div className={`current-weather ${getBackgroundClass()}`}>
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
            </div>
          )}

          {forecast.length > 0 && (
            <div className="forecast-container">
              <div className="forecast">
                <h3>Prévisions pour les prochains jours :</h3>

                <div className="forecast-cards">
                  {forecast.map((day, index) => (
                    <div
                      key={index}
                      className={`forecast-card ${getBackgroundClassForecast(
                        day
                      )}`}
                    >
                      <h4>
                        {new Date(day.dt * 1000).toLocaleDateString("fr-FR", {
                          weekday: "long",
                        })}
                      </h4>
                      <p>{day.weather[0].description}</p>
                      <p>Température : {day.main.temp}°C</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <footer>
          Images fournies par{" "}
          <a
            href="https://unsplash.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Unsplash
          </a>
          .
        </footer>
      </div>
    </div>
  );
}

export default App;
