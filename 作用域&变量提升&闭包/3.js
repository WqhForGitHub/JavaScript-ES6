var friendName = 'World';
(function () {
    if (typeof friendName === 'undefined') {
        var friendName = 'Jack';
        console.log('Goodbye ' + friendName);
    } else {
        console.log('Hello ' + friendName);
    }
})();
