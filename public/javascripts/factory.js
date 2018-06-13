app.factory('Factory', ['$http', function ($http) {
	
	var f = {};

	f.addUser = function (data) {
		return $http.post("/users/add", data);
	};

	return f;
}]);