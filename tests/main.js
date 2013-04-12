define(['pilot/router'], function (router) {

    var main = pilot.config('viewContext');
    console.log(main);

    router.add({route: /^\/Users\/briancray\/Sites\/pilotjs\/tests\/index\.html$/, callback: index});

    function index () {
        main.innerHTML = 'Index | <a href="/mypage">My Page</a>';
    }

    function my_page () {
        main.innerHTML = '<a href="/">Index</a> | My Page';
    }
});




