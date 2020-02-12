
var APIKEY = "27d770121968a991c04d1c73a8d7f8b7";

//---------------------------rendering current conditions

function current_conditions(city_name){

    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city_name + "&APPID=" + APIKEY + "&units=imperial";

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        console.log(response);
        
        $("#current-weather-city").empty();
        $("#current-weather-city").text(response.name + " (" + moment().format('l') +") ");
        var icon = $("<img>");
        icon.attr("src", "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png");
        $("#current-weather-city").append(icon);
        //$("#current-weather-city").append("<p>example</p>");

        $("#current-weather-temp").text("Temperature: " + response.main.temp + "°F");
        $("#current-weather-humidity").text("Humidity: " + response.main.humidity + "%");
        $("#current-weather-windspeed").text("Wind Speed: " + response.wind.speed + " MPH");
        UV_index(response.coord.lat, response.coord.lon);
    });
}

function UV_index(latitude, longitude){
    var queryURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKEY + "&lat=" + latitude + "&lon=" + longitude;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        $("#current-weather-UVindex").text("UV Index: " + response.value);
    });
}

//---------------------------rendering five day forecast

function five_day_forecast(city_name){
    $("#five-day-forecast").empty();
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city_name + "&APPID=" + APIKEY + "&units=imperial";

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        console.log(response);
        
        for(var i = 0; i < 5; i++){
            var new_day = $("<div>");
            new_day.attr("class","container");

            var day_date = $("<p>");
            var day_icon = $("<img>");
            var day_temp = $("<p>");
            var day_humidity = $("<p>");

            day_date.text(moment().add(i + 1, 'days').format("l"));
            day_icon.attr("src", "https://openweathermap.org/img/w/" + response.list[i * 8].weather[0].icon + ".png");
            day_temp.text("Temperature: " + response.list[i * 8].main.temp + "°F");
            day_humidity.text("Humidity: " + response.list[i * 8].main.humidity + "%");

            new_day.append(day_date, day_icon, day_temp, day_humidity);
            new_day.attr("style", "background-color: blue; width:150px; float: left; margin:10px;")
            $("#five-day-forecast").append(new_day);
        }
    });
}

//---------------------------managing local storage

function initialize_history(){
    if(localStorage.length < 1){ //initialize localstorage if it's empty
        var history = [];
        history[0] = "Los Angeles";

        localStorage.setItem("history", JSON.stringify(history)); //this will be a JSON object to store our history
        localStorage.setItem("last_search", "Los Angeles"); //saves the last item the user searched
    }
    console.log(JSON.parse(localStorage.getItem("history")));
}

function add_to_history(new_item){
    var history = JSON.parse(localStorage.getItem("history"));
    history.unshift(new_item); //adds most recent item to top of history
    localStorage.setItem("history", JSON.stringify(history));
}

function render_search_history(){
    var history = JSON.parse(localStorage.getItem("history")); //grab history list from local storage
    if(history != null){
        $("#history-list").empty(); //wipe current screen to avoid duplication

        for(var i = 0; i < history.length; i++){
            var new_button = $("<button>"); //each history item will be a button
            new_button.attr("class", "list-group-item list-group-item-action");
            new_button.text(history[i]);
            new_button.attr("data", history[i]);
            new_button.on("click", function(){ //button queries for weather conditions & forecast of the button's city
                current_conditions($(this).text());
                five_day_forecast($(this).text());
                localStorage.setItem("last_search", JSON.stringify($(this).text()));
            })
            $("#history-list").append(new_button);
        }
    }

    
}

//---------------------------searching functionality

function search_city(){
    //console.log("testing");
    var search_term = $("#search-box").val();
    //console.log(search_term);
    current_conditions(search_term);
    five_day_forecast(search_term);
    add_to_history(search_term);
    render_search_history();
    localStorage.setItem("last_search", JSON.stringify(search_term)); //saves the last item the user searched
    //console.log("searched");
}

function render_last_search(){
    //renders the most recent city that was searched, according to the local storage
    
    var last_searched = JSON.parse(localStorage.getItem("last_search"));
    if (last_searched != null){
        console.log(last_searched);
        current_conditions(last_searched);
        five_day_forecast(last_searched);
        render_search_history();
    }
    
}

//---------------------------startup 

$(document).ready(function() {
    $("#search-btn").on("click", search_city);
    initialize_history();
    render_search_history();
    render_last_search();
});