/* 
  This script grabs JSON data from Firebase, filters out the data that
  doesn't satisfy the display criteria, and displays it on a map. The
  display criteria is specified by sliders, and the map uses the Google
  Maps Javascript API V3. Google's geocoding service is used, which has
  a daily limit around 2000 hits. This script is run during initialization
  of the map, and when the "Filter" button is clicked.

  Future works: 
  1) This script pulls the remote JSON data every time the Filter button 
  is pressed, and this data requires geocoding. We can save all data 
  during initialization to an array (i.e. markers_array), and just choose
  which data should be displayed when the "Filter" button is clicked.
  2) We are not plotting military reports that only have the 
  "GPS coordinate" field filled out. This map only consider reports if
  "accident city", "accident country", "diagnostic city", or 
  "diagnostic city" are filled in the report.


*/
var map;
var markers_array = [];
var geocoder;


$(document).ready(initialize);

function initialize() {
  var mapOptions = {
    zoom:   2,
    center: {lat: 25, lng: 10},  // TODO: nice to use geo API to center on user
    overviewMapControl: false,
    streetViewControl:  false,
    mapTypeControl:     false,
    mapTypeId:          google.maps.MapTypeId.SATELLITE,
    panControl:         true,
    rotateControl:      false,
    scaleControl:       false,
    scrollwheel:        false,
    zoomControl:        true,
    zoomControlOptions: {style: google.maps.ZoomControlStyle.SMALL}
    //styles: [MAGIC]  Styles to apply to each of the default map types. Note that for Satellite/Hybrid and Terrain modes, these styles will only apply to labels and geometry.
    // SEE: https://developers.google.com/maps/documentation/javascript/reference?csw=1#MapTypeStyle
    // SEE: https://developers.google.com/maps/documentation/javascript/reference?csw=1#MapTypeStyleElementType
  };
  map = new google.maps.Map(document.getElementById('map_canvas'),
    mapOptions);
  
  var centerListenter = google.maps.event.addListener(map, 'center_changed', checkBounds);
  
  
  //when zoom == 2,  use lat = -35/35
  //when zoom == 3,  use lat = -73.3/73.3
  //when zoom == 5,  use lat = -83.3/83.3
  //when zoom == 7,  use lat = -84.6/84.6
  var max_center_lat = 35;
  var allowedBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(-max_center_lat, -180),
    new google.maps.LatLng( max_center_lat,  180));
  //new google.maps.Rectangle({map: map}).setBounds(allowedBounds);

  function checkBounds() {
    if (centerListenter)
      google.maps.event.removeListener(centerListenter);
//     console.log(map.getCenter().lat());
//     console.log(map.getCenter().lng());
    if( !allowedBounds.contains(map.getCenter()) ) {
      var mapCenter = map.getCenter();
      var c_lat = mapCenter.lat();
      var c_lng = mapCenter.lng();
      var new_lat = ( c_lat >= 0 ? max_center_lat : -max_center_lat );
      var new_lng = c_lng;  //just move vertically
      map.setCenter(new google.maps.LatLng(new_lat,new_lng));
    }
    centerListenter = google.maps.event.addListener(map, 'center_changed', checkBounds);
  }

  filterMap();

  // code for map legend
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].
  push(document.getElementById('legend')); 
  var label_accident = "Accident location";
  var icon_accident = 'images/marker_accident.png';
  var label_diagnosed = "Diagnostic location";
  var icon_diagnosed = 'images/marker_diagnosed.png';
  $('#legend').html('Legend'+'<br>'+
    '<img src="' + icon_accident + '"> ' + label_accident
    +'<br>'
    +'<img src="' + icon_diagnosed + '"> ' + label_diagnosed);
  // end of the code for map legend

  geocoder=new google.maps.Geocoder();

  //map styling
  var map_styles = [
  {
    stylers: [
    { hue: "#00ffe6" },
    { saturation: -20 }
    ]
  },{
    featureType: "road",
    elementType: "geometry",
    stylers: [
    { lightness: 100 },
    { visibility: "simplified" }
    ]
  },{
    featureType: "road",
    elementType: "labels",
    stylers: [
    { visibility: "off" }
    ]
  }
  ];
  map.setOptions({styles: map_styles});

}

//grabs JSON file and loops through each report
function filterMap()
{
  deleteMarkers();
  $.getJSON( 
    "https://landmine.firebaseio.com/.json", function() {
      console.log( "success" );
    })
  .done(function( data ) {

    var current_time = new Date();

    var current_year = current_time.getFullYear();

    for (var entry in data) 
    {  
      var age = parseInt(data[entry].age);

      // we just need to fetch the year
      var date_string=data[entry].date_injured;
      var date_parts = date_string.split("/");
      var date_obj = new Date(  parseInt(date_parts[2], 10),
                                parseInt(date_parts[1], 10)-1,
                                parseInt(date_parts[0], 10));
      var date_injured= date_obj.getFullYear();

      var age_limits=$('#ageSlider').data('slider').getValue();
      var age_lb=age_limits[0];
      var age_ub=age_limits[1];
      
      var date_limits=$('#dateSlider').data('slider').getValue();
      var date_lb=date_limits[0];
      var date_ub=date_limits[1];

      // 1) The ith element of data_status indicates whether the current data
      // entry (the current report) satisfies the range specified by ith slider
      // 2) We have the age slider in element 0, and the date slider in element 1
      var data_status = [ (age>=age_lb) && (age <= age_ub),
                          (date_injured>= date_lb ) && (date_injured<=date_ub)];


      // check input
      if( (age=="") || (age<0 )|| (age>150))
      {
        data_status[0]=false;
      }

      if( (date_injured=="") || (date_injured< 1900) || (date_injured > current_year))
      {
        data_status[1]=false;
      }

      var plot_flag=true;
      for (var i = 0; i < data_status.length; i++) 
      { 
        plot_flag=plot_flag && data_status[i];
      }

      // Try to geocode and place marker if it passed the filters
      if (plot_flag==true) 
      {
        var city_diagnosed = data[entry].city_diagnosed;
        var country_diagnosed = data[entry].country_diagnosed;
        var marker_diagnosed = 'images/marker_diagnosed.png';
        prepAddress(city_diagnosed,country_diagnosed,marker_diagnosed);

        var city_accident = data[entry].city_accident;
        var country_accident = data[entry].country_accident;
        var marker_accident = 'images/marker_accident.png';
        prepAddress(city_accident,country_accident,marker_accident);
      }
    }



  });
}
function prepAddress(first_choice,second_choice,icon_src)
{
  if (first_choice=="") 
  {
    if (second_choice!="") 
    {
      codeAddress(second_choice,icon_src);
    }
  }
  else
  {
    codeAddress(first_choice,icon_src);
  }
}
/* Code adapted from 
https://developers.google.com/maps/documentation/javascript/geocoding */
function codeAddress(sAddress,icon_src)
{
  geocoder.geocode({ 'address':sAddress}, 
    function(results,status)
    {

      if(status==google.maps.GeocoderStatus.OK)
      {
        var marker = new google.maps.Marker({
          map:map,
          position:results[0].geometry.location,
          icon: icon_src
        });
        markers_array.push(marker);
      }
      else
      {
        console.log("Geocode was not successful"); 
        //alert("Geocode was not successful for the following reason: "+status)
      }

    });
}

// Sets the map on all markers in the array.
function setAllMap(map) {
  for (var i = 0; i < markers_array.length; i++) {
    markers_array[i].setMap(map);
  }
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers_array = [];
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setAllMap(null);
}
/*
// Shows any markers currently in the array.
function showMarkers() {
  setAllMap(map);
}
*/