function redirectToHome() {
  window.location.replace("home.html");
}

var $ = jQuery.noConflict();

$(document).ready(function() {
  
  // auto-fills Date fields
  var unformattedDate = new Date();
  var year   = unformattedDate.getFullYear();          // ex: "2014"
  var day    = unformattedDate.getDate();              // ex: "14"
  var month  = unformattedDate.getMonth() + 1;         // ex: "7"
  
  var currentDate = day + "/" + month + "/" + year;    // ex: "14/7/2014"
  var dateInjuredElem   = $("#dateInjured");
  var dateDiagnosedElem = $("#dateDiagnosed");
  if (dateInjuredElem)
    dateInjuredElem.val(currentDate);                  // set form with today's date
  if (dateDiagnosedElem)
    dateDiagnosedElem.val(currentDate);                // set form with today's date
  
  // auto-fills GPS fields via Opt-In GeoLocation API
  var didSuccessfullySetGPS = false;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        var gpsLatElem = $('#GPS_lat');
        var gpsLonElem = $('#GPS_lng');
        if ( gpsLatElem )
          gpsLatElem.val(position.coords.latitude);    // sets form with GPS coords lat
        if ( gpsLonElem )
          gpsLonElem.val(position.coords.longitude);   // sets form with GPS coords lat
        didSuccessfullySetGPS = true;
      },
      function() {
        // Error: No can haz locations!
        didSuccessfullySetGPS = false;
      }
    );
  }
  
  // auto-fills Country, City, and GPS fields
  $.getJSON('http://freegeoip.net/json/', function(location) {     // returns a JSON object that contains information based on current IP
    var cityAccidentElem  = $('#city_a');
    var cityDiagnosisElem = $('#city_d');
    var countryAccidentElem  = $('#country_a');
    var countryDiagnosisElem = $('#country_d');
    var gpsLatElem = $('#GPS_lat');
    var gpsLonElem = $('#GPS_lng');
    
    if ( cityAccidentElem.length )
       cityAccidentElem.val(location.city);               // sets form with Accident City
    
    if ( countryAccidentElem.length )
      countryAccidentElem.val(location.country_name);     // sets form with Accident Country
    
    if ( cityDiagnosisElem.length )
      cityDiagnosisElem.val(location.city);               // sets form with Diagnosed City
    
    if ( countryDiagnosisElem.length )
      countryDiagnosisElem.val(location.country_name);    // sets form with Diagnosed Country
    
    if (!didSuccessfullySetGPS) {                         // only if GeoLocation API failed/was denied
      if ( gpsLatElem.length )
        gpsLatElem.val(location.latitude);                // sets form with GPS coords
      
      if ( gpsLonElem.length )
        gpsLonElem.val(location.longitude);               // sets form with GPS coords
    }
  });

});





function pushIncidentToDB(callbackFxn){
  
  // Connect to DB...
  var dataBaseReference = new Firebase('https://landmine.firebaseio.com/');
  
  // Initialize Defaults...
  var type_of_report  = $('form').attr('id');
  var no_data_default = "no-data";
  var data = {'type_of_report':    type_of_report,
              'GPS_latitude':      no_data_default,
              'GPS_longitude':     no_data_default,
              'city_accident':     no_data_default, 
              'country_accident':  no_data_default, 
              'city_diagnosed':    no_data_default, 
              'country_diagnosed': no_data_default, 
              'date_injured':      no_data_default, 
              'date_diagnosed':    no_data_default, 
              'age':               no_data_default,
              'gender':            no_data_default,
              'explosive_type':    no_data_default, 
              'injury':            no_data_default, 
              'treatment':         no_data_default
  };
  
  // Fetch Inputs via jQuery...
  var inputs = {'GPS_latitude':      $("#GPS_lat"),
                'GPS_longitude':     $("#GPS_lng"),
                'city_accident':     $("#city_a"), 
                'country_accident':  $("#country_a"), 
                'city_diagnosed':    $("#city_d"), 
                'country_diagnosed': $("#country_d"), 
                'date_injured':      $("#dateInjured"), 
                'date_diagnosed':    $("#dateDiagnosed"), 
                'age':               $("#age"),
                'gender':            $("#gender"),
                'explosive_type':    $("#typeofexplosive"), 
                'injury':            $("#injury"), 
                'treatment':         $("#treatment")
  };
  
  // Overwrite data iff that input exists in this form...
  for ( var i in inputs )                              // for each index in inputs,
    if ( inputs[i].length )    //   if jQuery selector was successful for that index and the input isn't the empty string,
      data[i] = inputs[i].val();                       //     then overwrite that index with value
  
  // Push to DB...
  if (callbackFxn !== undefined)
    dataBaseReference.push(data,callbackFxn);
  else
    dataBaseReference.push(data);
  
}

