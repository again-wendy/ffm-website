$(document).ready(function() {
    // Load right flag in menu to set language
    if(checkLang().indexOf("nl") != -1) {
        $("#language").append('<a onclick="setLang(\'en\')"><img src="./public/images/en.png" alt="English"></a>');
    } else {
        $("#language").append('<a onclick="setLang(\'nl\')"><img src="./public/images/nl.png" alt="Nederlands"></a>');
    }

    // Set active role
    setActiveRoleLink();

    // Open newsletter popup
    newsletterBlock();
});

function getContactData() {
    $.get("http://localhost:3000/database/contact", function(data) {
        for (var i = 0; i < data.length; i++) {
            $("#contactTable").fadeIn();
            $("#contactTable tbody").append("<tr><td>" + data[i].contactName + "</td><td>" + data[i].contactEmail + "</td><td>" + data[i].date + "</td><td>" + data[i].contactSubject + "</td><td>" + data[i].contactMsg + "</td></tr>")
        }
    });
}

// Open newsletter popup when user hasn't closed it in the last 7 days
function newsletterBlock() {
    if( Cookies.get("newsletter" !== "closed") ) {
        window.setTimeout(function() {
            $("#newsletter").fadeIn();
        }, 6000);
    } 
}

// Close newsletter popup and set cookie so it doesn't show for 7 days
function closeNewsletterBlock() {
    Cookies.set("newsletter", "closed", { expires: 7 });
    $("#newsletter").fadeOut();
}

// Menu scroll to section
function menuScroll(name) {
    $("html, body").animate({
        scrollTop: $(name).offset().top
    }, 1000);
}

// Check for hover on dropdown menu
$('.dropdown').hover(
    function() {
        setTopDropdown();
        $(".dropdown > .dropdown-menu").slideDown();
    }, 
    function() {
        $(".dropdown > .dropdown-menu").slideUp();
    }
);

// Set top of drowndown menu
function setTopDropdown() {
    var navHeight = $("#navbar").height();
    var ddOffset = $(".dropdown").offset().top;
    var offsetTop = navHeight - ddOffset;
    $(".dropdown .dropdown-menu").css("top", offsetTop + "px");
}

// Check for active role and set link to active
function setActiveRoleLink() {
    var cookieRole = document.cookie;
    var roleIndex = cookieRole.indexOf("role") + 5;
    var role = cookieRole.substr(roleIndex);
    $(".dropdown-menu > item").removeClass("active");

    if (roleIndex != -1) {
        $(".dropdown-menu > ." + role).addClass("active");
    }
}

// Check the language
function checkLang() {
    var userLang = navigator.language || navigator.userLanguage;
    var url = window.location.href;
    if( url.indexOf("?clang=") == -1 ) {
        return userLang;
    } else {
        return url.substr(-2, 2);
    }
}

// Set the language
function setLang($event) {
    var url = window.location.href;
    if( url.indexOf("?clang=") == -1 ) {
        window.location.href = url + "?clang=" + $event;
    } else {
        var tempUrl = url.substr(0, url.length - 2);
        window.location.href = tempUrl + $event;
    }
}