import axios from 'axios';
import React, {useEffect, useState} from 'react';
import CurrentWeather from './components/CurrentWeather';
import Conditions from './components/Conditions';
import Forecast from './components/Forecast';
import Chart from './components/Chart';

const API_KEY = process.env.API_KEY;


function App() {

  //hold weather data
  const [currentWeather, setCurrentWeather] = useState({
    weather: "",
    temp: "",
    icon: "",
    humidity: "",
    windSpeed: "",
    city:""
  })

  //hold forecast data
  const [midDayForecastData, setMidDayForecastData] = useState(null)

  const [searchedCity, setSearchedCity] = useState("")

  const [allForecastData, setAllForecastData] = useState(null);

  const [selectedForecast, setSelectedForecast] = useState("")



  //holds forcast button name when clicked so we can set a color on that button
  const [activeButton, setActiveButton] = useState({
    id: "",
    class: ""
  });

  //when the app iniaitlly runs we're getting the user's location and setting weather and forecast state to that location

  //grab weather data from api
  async function getWeatherData(url) {
    const {data} = await axios.get(url)
    setCurrentWeather(prevWeather => ({
      ...prevWeather,
      weather: data.weather[0].main,
      temp: Math.round(data.main.temp),
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed*3.6*100)/100,
      city: data.name
    }))
  }

  //grab forecast data from api
  async function getForecastData(url) {
    const {data} = await axios.get(url)
    setAllForecastData(data.list)
    let filteredData = data.list.filter(item => {
      return item.dt_txt.includes('12:00')
    });
    setMidDayForecastData(filteredData)
  }

//check for geolocation when app renders, if location found, then get data from API
  useEffect(() => {
    if("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {
        getWeatherData(`https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${API_KEY}`)
        getForecastData(`https://api.openweathermap.org/data/2.5/forecast?units=metric&lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${API_KEY}`)
      }) 
    } else {
      alert("location not available")
    }
  }, []);

  //handle forcast button clicks
  function handleForecastClick(e) {
    setActiveButton(prev => ({
      id: e.target.id,
      class: e.target.className
    }));

    setSelectedForecast(e.target.id)
  }

  function handleInputChange(e) {
    setSearchedCity(e.target.value)
  }

  //handle search bar submission and get api data from entered city
  function handleFormSubmit(e) {
    e.preventDefault()
    getWeatherData(`https://api.openweathermap.org/data/2.5/weather?units=metric&q=${searchedCity}&appid=${API_KEY}`)

    getForecastData(`https://api.openweathermap.org/data/2.5/forecast?units=metric&q=${searchedCity}&appid=${API_KEY}`)
    
    setSearchedCity("")
  }

  return (
    <div className="weather-container">

      <div className="search-bar">
        <form onSubmit={handleFormSubmit}>
          <input type="text" placeholder="Search a City" value={searchedCity} onChange={handleInputChange}></input>
          <button>Go</button>
        </form>
        
        <div className="city">
          <h2>{currentWeather.city}</h2>
        </div>
      </div>

      {currentWeather ? 
      <CurrentWeather 
        weather={currentWeather.weather} 
        temp={currentWeather.temp} 
        icon={currentWeather.icon}
        activeButton={activeButton.class}
      />
      :
      null
      }
     
      {currentWeather ? 
      <Conditions 
        humidity={currentWeather.humidity}
        windSpeed={currentWeather.windSpeed}
      />
      : null}

      {allForecastData ? 
      <Chart
        currentTemp={currentWeather.temp}
        selectedForecast={selectedForecast}
        allForecastData={allForecastData}
        activeButton={activeButton.class}
      />
      : null
      }
     

      {midDayForecastData ? <Forecast 
        forecastData={midDayForecastData}
        handleClick={handleForecastClick}
        isActive={activeButton.id}
        checkClass={activeButton.class}
      /> 
      : null}
      

    </div>
  );
}

export default App;
