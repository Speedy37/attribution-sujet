var $ = require('jquery-browserify');

exports.request = function(url) {
    return $.ajax(url, {
        dataType: "json",
        type: "GET"
    });
};

exports.submit = function(url, data) {
    return $.ajax(url, {
        data: data,
        dataType: "json",
        type: "POST"
    });
};