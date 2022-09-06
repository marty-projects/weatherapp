const time = document.querySelector('.time');
const timeText = document.querySelector('.time-text');
const timeSpec = document.querySelector('.time-spec');
const timeZone = document.querySelector('.time-zone');
const locationText = document.querySelector('.location-text');
const todayTemp = document.querySelector('.today-temp');
const todayIcon = document.querySelector('.today-icon');
const container = document.querySelector('.container');
const weatherDaysAll = document.querySelector('.weather-days');
const donut = document.querySelector('.donut');

const appController = (function () {

    const setUpTheme = () => {
        const time = new Date().getHours();
        const changeColor = (prop) => {
            timeText.style.color = prop;
            timeSpec.style.color = prop;
            locationText.style.color = prop;
            timeZone.style.color = prop;
        }
    if (time < 6 || time >= 20) {
        container.style.backgroundImage = `url(./img/evening_01.jpg)`;
        changeColor('white');
    } else if (time >= 6 && time <= 13) {
        container.style.backgroundImage = `url(./img/morning_01.jpg)`;
        changeColor('black');
    } else if (time > 13 && time < 20) {
        container.style.backgroundImage = `url(./img/afternoon_01.jpg)`;
        changeColor('white');
    }}

    const displayTime = () => {
        let text = '';
        const today = new Date();
        const time = new Date().toLocaleTimeString('en-UK');
        const spec = time.slice(time.length - 2, time.length);

        if (time.length > 10) {
            text = time.slice(0,5);
        } else {
            text = time.slice(0, 4)
        }

        timeText.textContent = text;
        timeSpec.textContent = spec.toLocaleLowerCase();
        timeZone.textContent = today.toLocaleDateString(undefined, { timeZoneName: 'long' }).split(",")[1].replace(/[^A-Z]/g, '');
    }
    
    const getDayOfTheWeek = (dt) => {
        const days = [
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
        ];
        const dayNum = new Date(dt * 1000).getDay();
        const result = days[dayNum];
        return result;
    }
    
    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(setPosition);
        } else {
            console.log("Geolocation is not available");
        }
    }
    
    const setPosition = (position) => {
        let lat = position.coords.latitude;
        let long = position.coords.longitude;
        getWeather(lat,long);
    }

    const setUpData = (data) => {
        let weatherObj = {};
        let allTemp;
        let allIcons;
        
        for (let i in data.list) {
            const day = getDayOfTheWeek(data.list[i].dt);
            allTemp = Math.floor(data.list[i].main.temp);
            allIcons = data.list[i].weather[0].icon;

            if (weatherObj[day] == undefined) {
                weatherObj[day] = {};
                weatherObj[day].temps = [];
                weatherObj[day].icons = [];
            }

            weatherObj[day].temps.push(allTemp);
            weatherObj[day].tempHigh = Math.max(...weatherObj[day].temps);
            weatherObj[day].tempLow = Math.min(...weatherObj[day].temps);
            weatherObj[day].icons.push(allIcons);
        }

        return weatherObj;
    }

    const displayLocation = (city, country) => {
        locationText.textContent = `${city.toUpperCase()}, ${country.toUpperCase()}`;
    }

    const displayTodaysWeather = (temp, icon) => {
        todayTemp.textContent = `${temp}°`;
        todayIcon.style.backgroundImage = `url(./icons/${icon}.png)`;
    }

    const displayAllWeather = (day, {icons, tempHigh, tempLow}) => {
        donut.style.display = "none";
        const weather = document.createElement('div');
        weather.className = "weather-days";

        weather.insertAdjacentHTML(
            "beforeend",
            `
            <h3 class="day-text">${day}</h3>
            <div class="day-icon">
            <img src="./icons/${icons[2]}.svg" alt="weather icon" />
            </div>
            <p class="day-temp-max">${tempHigh}°</p>
            <p class="day-temp-min">${tempLow}°</p>
            `
        );

        weatherDaysAll.insertAdjacentElement("beforeend", weather);
    }

    const todayIs = () => {
        const today = new Date().getDay();
        const days = ["Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",];
        return days[today];
    }

    const refreshTime = () => {
        return setInterval(displayTime, 1000);
    }

    async function getWeather(latitude, longitude) {
        const key = `2ae4df3c6d3c9c1bdfdecb794cc23894`;
        
        try {
            const result = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${key}`
            );
            const data = await result.json();

            const weather = setUpData(data);
            const cityName = data.city.name;
            const country = data.city.country;
            const todayTemp = Math.floor(data.list[0].main.temp);
            const todayIcon = data.list[0].weather[0].icon;
            
            for (let [key, val] of Object.entries(weather)) {
                if (key != todayIs()) {
                    displayAllWeather(key, val);
                }
            }

            displayLocation(cityName, country);
            displayTodaysWeather(todayTemp, todayIcon)

        } catch (err) {
            console.log(err);
        }}

        function init() {
            getLocation();
            setUpTheme();
            refreshTime();
        }
        
        init(); 
    }) ();
