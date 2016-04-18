var CLIENT_ID = '523819935458-067tls3kg8s2odnrtd7bl622r4a0dlfn.apps.googleusercontent.com';
var SCOPES = ["https://www.googleapis.com/auth/calendar"];
var apiKey = 'AIzaSyBZn5Aizlu94stQI6oCdz4SpwIqHfhyfQo';

// from https://developers.google.com/api-client-library/javascript/start/start-js#how-it-looks-in-javascript
function handleClientLoad() {
// Step 2: Reference the API key
    gapi.client.setApiKey(apiKey);
    window.setTimeout(checkAuth,1);
}

/**
 * Check if current user has authorized this application.
 */
function checkAuth() {
    gapi.auth.authorize(
        {
            'client_id': CLIENT_ID,
            'scope': SCOPES.join(' '),
            'immediate': true
        }, handleAuthResult);
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result. An OAuth2 token object.
 */
function handleAuthResult(authResult) {
    var authorizeDiv = document.getElementById('authorize-div');
    if (authResult && !authResult.error) {
// Hide auth UI, then load client library.
        authorizeDiv.style.display = 'none';
        console.log("access_token: " + authResult.access_token);
        //noinspection JSUnresolvedVariable
        setInterval(console.log("expires_in: " + authResult.expires_in), 10000);
        console.log("state: " + authResult.state);
        //loadCalendarApi(); //instead of loading here, i moved it to the onload of the body
    } else {
// Show auth UI, allowing the user to initiate authorization by
// clicking authorize button.
        console.log("Janac - error: " + authResult.error);
    authorizeDiv.style.display = 'inline';
    }
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
function handleAuthClick(event) {
    gapi.auth.authorize(
        {client_id: CLIENT_ID, scope: SCOPES, response_type: "token", immediate: true},
        handleAuthResult);
    return false;
}

function getIntervalTime() {
    var i = 1800 * 1000;  //half hr
    // var i = 900 * 1000;  //15 mins
    //var i = 5000;
    return i;
}

/**
 * Load Google Calendar client library. List upcoming events
 * once client library is loaded.
 *
 * This function is called onload of the body
 */
function loadCalendarApi() {
    var intervalTime = getIntervalTime();
    console.log("prompt interval occurs every: " + intervalTime + "milliseconds");
    document.getElementById("PromptIntervalTime").innerHTML = intervalTime/1000;
    gapi.client.load('calendar', 'v3', setInterval(createEvent,intervalTime)); // with interval popups
    setInterval(checkAuth, 1000*1000); //get access token every 1000 seconds.
}

// code below is from https://developers.google.com/google-apps/calendar/v3/reference/events/insert#examples
function createEvent() {
    var currentTime = new Date();
    alert(currentTime);
    var userInput = prompt("How did you spend your last hour?");

    var event = {
        'summary': userInput,
        'description': 'Created by reverse calendar',
        'start': {
            // 'dateTime': '2016-03-14T09:00:00-04:00', //the time specified here will be the time in toronto
            // 'dateTime': new Date(Date.now() - 3600*1000),
            'dateTime': new Date(Date.now() - getIntervalTime()),
            'timeZone': 'America/Toronto'
        },
        'end': {
            // 'dateTime': '2017-03-14T10:00:00-04:00',
            'dateTime': currentTime, //should round this to nearest half-hour?
            'timeZone': 'America/Toronto'
        },
        'reminders': {
            'useDefault': false,
            'overrides': [
                {'method': 'email', 'minutes': 24 * 60},
                {'method': 'popup', 'minutes': 10}
            ]
        }
    };

    var request = gapi.client.calendar.events.insert({ //assemble the request
        'calendarId': 'primary',
        'resource': event
    });

    request.execute(function(event) { //execute the api request. could use "then" instead
        appendPre('Event created: ' + event.htmlLink);
    });

    document.getElementById("timeLeft").innerHTML = new Date(Date.now() + getIntervalTime());
    //document.getElementById("timeUntilTokenExpiration").innerHTML = ; //was going to add a little counter here

}

/**
 * Append a pre element to the body containing the given message
 * as its text node.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
    var pre = document.getElementById('output');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}
