angular.module("landmine", ["firebase"])
    .factory("LocationTypes", ["$firebase", function($firebase) {
        var ref = new Firebase("https://landmine.firebaseio.com/");
        return $firebase(ref);
    }])
    .controller("Landmines", ["$scope", "LocationTypes",
        function($scope, LocationTypes) {
    // Get types & ratings.
    $scope.Locations = LocationTypes;
    }
    ]);