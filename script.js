angular.module('weatherApp', [])
    .controller('WeatherController', ['$http', function ($http) {
        var self = this;
        self.searchCity = '';
        self.searchHistory = [];
        self.currentWeather = {};
        self.futureWeather = [];
        var APIKey = 'a0aca8a89948154a4182dcecc780b513';

        self.displayWeather = function () {
            var city = self.searchCity.trim();
            var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
            $http.get(queryURL)
                .then(function (response) {
                    var weathericon = response.data.weather[0].icon;
                    var iconurl = "https://openweathermap.org/img/wn/" + weathericon + "@2x.png";
                    var date = new Date(response.data.dt * 1000).toLocaleDateString();
                    self.currentWeather = {
                        name: response.data.name + " (" + date + ")",
                        temperature: (response.data.main.temp - 273.15).toFixed(2) + "°C",
                        humidity: response.data.main.humidity + "%",
                        windSpeed: (response.data.wind.speed).toFixed(1) + " m/s",
                        uvIndex: '', // Placeholder for UV index
                        iconurl: iconurl
                    };
                    UVIndex(response.data.coord.lon, response.data.coord.lat);
                    self.futureWeather = [];
                    forecast(response.data.id);
                    saveToHistory(response.data.name);
                })
                .catch(function (error) {
                    console.error('Error fetching current weather data:', error);
                });
        };

        function saveToHistory(city) {
            if (self.searchHistory.indexOf(city) === -1) {
                self.searchHistory.push(city);
            }
        }

        function UVIndex(lon, lat) {
            var uvqURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + lat + "&lon=" + lon;
            $http.get(uvqURL)
                .then(function (response) {
                    self.currentWeather.uvIndex = response.data.value;
                })
                .catch(function (error) {
                    console.error('Error fetching UV index data:', error);
                });
        }

        function forecast(cityid) {
            var queryforcastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityid + "&appid=" + APIKey;
            $http.get(queryforcastURL)
                .then(function (response) {
                    for (var i = 0; i < 5; i++) {
                        var date = new Date(response.data.list[((i + 1) * 8) - 1].dt * 1000).toLocaleDateString();
                        var iconcode = response.data.list[((i + 1) * 8) - 1].weather[0].icon;
                        var iconurl = "https://openweathermap.org/img/wn/" + iconcode + "@2x.png";
                        var tempK = response.data.list[((i + 1) * 8) - 1].main.temp;
                        var tempC = (tempK - 273.15).toFixed(2);
                        var humidity = response.data.list[((i + 1) * 8) - 1].main.humidity;
                        self.futureWeather.push({
                            date: date,
                            img: iconurl,
                            temperature: tempC + "°C",
                            humidity: humidity + "%"
                        });
                    }
                })
                .catch(function (error) {
                    console.error('Error fetching forecast data:', error);
                });
        }

        self.invokePastSearch = function (city) {
            self.searchCity = city;
            self.displayWeather();
        };

        self.clearHistory = function () {
            self.searchHistory = [];
        };
    }]);
