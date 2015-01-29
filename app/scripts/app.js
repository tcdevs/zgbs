/**
 * myApp
 * @module myApp
 * @description This is the main module for the MyApp
 * @author  Jano Meijer
 * @copyright Technische Centrale
 */
angular.module('myApp', [])
.controller('MyCtrl', ['$scope', '$http', function ($scope, $http) {  
	console.log('WTF');
	$scope.title = 'John Doo';
}]);


/** 
 * @const
 * @type {string}
 * @default
 */
const RED = 'FF0000';

/** @constant {number} */
var ONE = 1;



/**
 * Represents a book.
 * @constructor
 * @param {string} title - The title of the book.
 * @param {string} author - The author of the book.
 * @example
 * // returns 2
 * globalNS.method1(5, 10);
 * @example
 * // returns 3
 * globalNS.method(5, 15);
 * @returns {Number} Returns the value of x for the equation.
 */
function Book(title, author) {
}

/**
 * Represents a User.
 * @constructor
 * @param {string} username - The username of the user.
 * @param {string} password - The password of the user.
 */
function User(username, password) {
}

/**
 * Solves equations of the form a * x = b
 * @example
 * // returns 2
 * globalNS.method1(5, 10);
 * @example
 * // returns 3
 * globalNS.method(5, 15);
 * @returns {Number} Returns the value of x for the equation.
 */
globalNS.method1 = function (a, b) {
    return b / a;
};

/**
 * @classDesc Make an object capable of handling a signal. Or many signals.
 * @exports mixins/signalable
 * @mixin
 * @extends base
 */
var Signalable = Base.compose();