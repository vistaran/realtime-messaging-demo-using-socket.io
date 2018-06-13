app.filter('timeAgo', ['$interval', function($interval) {
    // trigger digest every 60 seconds
    $interval(function() {}, 60000);

    function fromNowFilter(time) {
        return moment(time).fromNow();
    }

    fromNowFilter.$stateful = true;
    return fromNowFilter;
}]);


app.filter('timeAgoShort', ['$interval', function($interval) {
    // trigger digest every 60 seconds
    $interval(function() {}, 60000);

    function fromNowFilter(time) {
        tmp = moment(time).fromNow().split(" ");
        var joined = tmp.join(" ");
        switch (joined) {
            case "a day ago":
                tmp = [1, "d"];
                break;
            case "an hour ago":
                tmp = [1, "h"];
                break;
            case "a few seconds ago":
                tmp = [1, "s"];
                break;
            case "a minute ago":
                tmp = [1, "m"];
                break;
            case "a month ago":
                temp = [1, " month"];
                break;
            default:
                break;
        }
        return tmp[0] + tmp[1][0];
    }

    fromNowFilter.$stateful = true;
    return fromNowFilter;
}]);