$(document).ready(function() {
    // Load right flag in menu to set language
    if(checkLang().indexOf("nl") != -1) {
        $("#language").append('<a onclick="setLang(\'en\')"><img src="./public/images/en.png" alt="English"></a>');
        Cookies.set("ulang", "nl");
    } else {
        $("#language").append('<a onclick="setLang(\'nl\')"><img src="./public/images/nl.png" alt="Nederlands"></a>');
        Cookies.set("ulang", "en");
    }

    // Don't show mobile menu on page load
    if($(window).width() < 769) {
        $("#navbar .right-menu .menu-items").hide();
    }

    getBlogs();

    $(window).change(function() {
        if($(window).width() < 769) {
            $("#navbar .right-menu .menu-items").hide();
            $(".dropdown > .dropdown-menu").hide();
        } else {
            $("#navbar .right-menu .menu-items").show();
        }
    })

    // Animation banner
    animationBanner();

    // Set active role
    // setActiveRoleLink();

    // Open newsletter popup
    newsletterBlock();

    // Set active tab on terms and conditions page
    tabActive();

    // Set height elements on page load and when screen size changes
    heightElements();
    $(window).resize(function() {
        heightElements();
    });

    // Don't show button to page you already on in footer
    if(window.location.pathname == "/hirer") {
        $("#footer .roles .hirer").remove();
    } else if(window.location.pathname == "/supplier") {
        $("#footer .roles .supplier").remove();
    } else if(window.location.pathname == "/freelancer") {
        $("#footer .roles .freelancer").remove();
    }
});

function tabActive() {
    var path = window.location.pathname;
    $(".tab").removeClass("active");
    if(path.indexOf('generalconsiderations') > -1) {
        $(".tab-1").addClass("active");
    } else if(path.indexOf('termsandconditions') > -1) {
        $(".tab-2").addClass("active");
    } else if(path.indexOf('gdpr') > -1) {
        $(".tab-3").addClass("active");
    }
}

function animationBanner() {
    $(".animation-banner .banner-title:gt(0)").hide();
    setInterval(function() {
        $(".animation-banner :first-child").fadeOut(500).next(".banner-title").delay(800).fadeIn(500).end().appendTo(".animation-banner");
    }, 5000);
}

function getBlogs() {
    $.getJSON("blogs", function(data) {
        var items = data;
        var blogContainer = $("#blogs .section-container");
        blogContainer.text("");
        for(var i = 0; i < items.length; i++) {
            blogContainer.append(
                `<div class="blog">
                    <div class="image">
                        <div class="img-container">
                            <img src="${items[i].img}" alt="Featured image">
                        </div>
                    </div>
                    <a class="blog-link" href="${items[i].link}" target="_blank">
                        <h3>${ items[i].title.rendered }</h3>
                    </a>
                </div>`
            )
        }
    });
}

function heightElements() {
    // Height content on databasepages
    var fHeight = $("#footer").height();
    var bHeight = $("body").height();
    var dbHeight = bHeight - fHeight;
    $("#database").css("height", dbHeight + "px");
}

// Get all the contact data and show it in a table
// function getContactData() {
//     $.get("http://localhost:3000/database/contact", function(data) {
//         for (var i = 0; i < data.length; i++) {
//             $("#contactTable").fadeIn();
//             $("#contactTable tbody").append("<tr><td>" + data[i].contactName + "</td><td>" + data[i].contactEmail + "</td><td>" + data[i].date + "</td><td>" + data[i].contactSubject + "</td><td>" + data[i].contactMsg + "</td></tr>");
//             setWidthTableColums("#contactTable");
//         }
//     });
// }

// For tables with fixed header it's needed to set the width of the header th
function setWidthTableColums(tableId) {
    var thead = $(tableId + " thead tr");
    var tbody = $(tableId + " tbody tr:first-child");
    var widths = [];
    tbody.children('td').each(function() {
        var w = $(this).width() + 10;
        widths.push(w);
    });
    thead.children('th').each(function(i) {
        $(this).css("width", widths[i] + "px");
    });
}

// Open newsletter popup when user hasn't closed it in the last 7 days
function newsletterBlock() {
    if( Cookies.get("newsletter") != "closed" ) {
        window.setTimeout(function() {
            $("#newsletter-popup").fadeIn();
        }, 6000);
    } 
}

// Close newsletter popup and set cookie so it doesn't show for 7 days
function closeNewsletterBlock() {
    Cookies.set("newsletter", "closed", { expires: 7 });
    $("#newsletter-popup").fadeOut();
}

// Menu scroll to section
function menuScroll(name) {
    $("html, body").animate({
        scrollTop: $(name).offset().top
    }, 1000);
}

// Scroll content termspages
function termsScroll(name) {
    var offset = $(name).offset().top - 100;
    $("html, body").animate({
        scrollTop: offset
    }, 1000);
}

// Check for hover on dropdown menu
if($(window).width() > 768) {
    $('.dropdown').hover(
        function() {
            $(".dropdown > .dropdown-menu").slideDown();
        }, 
        function() {
            $(".dropdown > .dropdown-menu").slideUp();
        }
    );
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
    var cookieLang = Cookies.get("ulang");
    var userLang = navigator.language || navigator.userLanguage;
    var url = window.location.href;
    // Check if language is set in cookies
    if( cookieLang != undefined ) {
        return cookieLang;
    } else if( url.indexOf("?clang=") == -1 ) {
        return userLang;
    } else {
        return url.substr(-2, 2);
    }
}

// Set the language
function setLang($event) {
    var url = window.location.href;
    Cookies.set("ulang", $event);
    getBlogs();
    if( url.indexOf("?clang=") == -1 ) {
        window.location.href = url + "?clang=" + $event;
    } else {
        var tempUrl = url.substr(0, url.length - 2);
        window.location.href = tempUrl + $event;
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    var menu = $("#navbar .right-menu .menu-items");
    var icon = $("#navbar .right-menu .mobile-toggle .nav-icon");
    if( menu.css("display") === "none" ) {
        // open menu and change icon to cross
        menu.slideDown();
        icon.addClass("open");
    } else {
        // close menu and change icon to bars
        menu.slideUp();
        icon.removeClass("open");
    }
}

function flexjungleBlogLink() {
    if(checkLang().indexOf("nl") != -1) {
        window.open('http://flexjungle.flexforcemonkey.com/blogs-nl/', '_blank');
    } else {
        window.open('http://flexjungle.flexforcemonkey.com/blogs/', '_blank');
    }
}

function flexjungleNewsLink() {
    if(checkLang().indexOf("nl") != -1) {
        window.open('http://flexjungle.flexforcemonkey.com/nieuws/', '_blank');
    } else {
        window.open('http://flexjungle.flexforcemonkey.com/news/', '_blank');
    }
}

function flexjungleDownloadLink() {
    if(checkLang().indexOf("nl") != -1) {
        window.open('http://flexjungle.flexforcemonkey.com/downloads-nl/', '_blank');
    } else {
        window.open('http://flexjungle.flexforcemonkey.com/downloads/', '_blank');
    }
}