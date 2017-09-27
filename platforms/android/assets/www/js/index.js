var logoutAdress = "https://lecnam.net/deconnexion";
var planningAdress = "https://iscople.gescicca.net/Planning.aspx";

//Material colors
var eventColors = ["#F44336", "#673AB7", "#3F51B5", "#2196F3", "#009688", "#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800", "#FF5722", "#795548"];
var days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
var month = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
var dp;

var app =
{
    // Application Constructor
    initialize: function()
    {
        document.addEventListener('deviceready', app.onDeviceReady, false);
    },

    onDeviceReady: function()
    {
        var permanentStorage = window.localStorage;

        var permanentStorage = window.localStorage;
        var uid = permanentStorage.getItem("uid");
        if(uid != null)
        {
            app.onLogged();
        }
        else
        {
            showLoginPage();
        }
    },

    onLogged: function()
    {
        console.log("Logged");
        $("body").css("min-width", "1200px");
        $("#page1").hide();
        $("#page2").show();
        $("#menuContainer").click(function(e)
        {
            var permanentStorage = window.localStorage;
            $("#lastCache").html(lastCache());
            $("#userCDSC").html(permanentStorage.getItem("cdsc"));
            $(".overlayBar").css("background-color", "#03A9F4");
            displayOverlay("#overlayMenu");
        });

        $("#previous").click(function(e)
        {
            $('#previous')[0].disabled = true;
            dp.startDate = dp.startDate.addDays(-7);
            dp.update();
            updateTopBar();
            $('#previous')[0].disabled = false;
        });

        $("#next").click(function(e)
        {
            $('#next')[0].disabled = true;
            dp.startDate = dp.startDate.addDays(7);
            dp.update();
            updateTopBar();
            $('#next')[0].disabled = false;
        });

        $("#okButton").click(function(e)
        {
            $("#overlayPannel").hide();
        });

        $("#retryButton").click(function(e)
        {
            $('#retryButton')[0].disabled = true;
            loadPlanning();
        });

        $("#reloadButton").click(function(e)
        {
            $('#reloadButton')[0].disabled = true;
            loadPlanning();
        });

        $("#disconnect").click(function(e)
        {
            var permanentStorage = window.localStorage;
            permanentStorage.clear();
            location.reload();
        });

        $("#informations").click(function(e)
        {
            displayOverlay("#overlayInfo");
        });

        $(".closeOverlay").click(function(e)
        {
            $("#overlayPannel").hide();
        });

        $("#overlayPannel").click(function(e)
        {
            if(e.target == $("#overlayPannel")[0])
            {
                $("#overlayPannel").hide();
            }
        });

        window.addEventListener("scroll", scrollTopBar);
        window.addEventListener("resize", scrollTopBar);

        loadPlanning();
    }
};

function loadPlanning()
{
    $("#loader").show();

    var permanentStorage = window.localStorage;
    $.post(planningAdress, {uid: permanentStorage.getItem("uid"), code_scolarite:permanentStorage.getItem("cdsc"), cr:permanentStorage.getItem("cr")}, function(data)
    {
        displayPlanning(data, true);
        $("#overlayPannel").hide();

    }).fail(function(error)
    {
        var permanentStorage = window.localStorage;
        var events = JSON.parse(permanentStorage.getItem("events"));

        if(events != null)
        {
            displayPlanning(events, false);
            $("#errorTitle").html("Pas de connection");
            $("#errorInfo").html("Impossible de se connecter au service de planning...<br/><br/>" +
            "<span class='overlayLabel'>Dernière version du planning: </span><br/>" + lastCache());

            displayOverlay("#overlayError");
        }
        else
        {
            $("#errorTitle").html("Pas de connection");
            $("#errorInfo").html("Impossible de se connecter au service de planning...");
            displayOverlay("#overlayError");
            $("#loader").hide();
        }
    });
}

function displayOverlay(overlayId)
{
    //Re-Enable buttons
    $('#reloadButton')[0].disabled = false;
    $('#retryButton')[0].disabled = false;

    $("#overlayError").hide();
    $("#overlayEventInfo").hide();
    $("#overlayMenu").hide();
    $("#overlayInfo").hide();
    $(overlayId).show();
    $("#overlayPannel").show();
}

function updateTopBar()
{
    var today = new Date(dp.startDate);

	console.log((today.getDate() + 6) % 7);
    today.setDate(today.getDate() - (today.getDay() + 6) % 7);

    $(".menuDay").each(function(index)
    {
        $(this).html(days[index] + " " + toTwoDigits(today.getDate()) + " " + month[today.getMonth()]);
        today.setDate(today.getDate() + 1);
    });
}

function displayPlanning(data, online)
{
    dp = new DayPilot.Calendar("planning");
    dp.viewType = "Week";
    dp.locale = "fr-fr";
    dp.headerDateFormat = "dddd d MMMM";
    dp.columnWidthSpec = "Fixed";
    dp.columnWidth = 80;
    dp.headerHeightAutoFit = false;
    dp.headerHeight = 30;
    dp.theme = "calendar_green";
    dp.businessBeginsHour = 8;
    dp.businessEndsHour = 21;
    dp.heightSpec = "BusinessHours";
    dp.drawBlankCells = false;
    dp.width = "100%";
    dp.heightSpec = "Full";
    //dp.height = $(window).width();

    dp.onEventClicked = function(args)
    {
        $("#evTitle").html(args.e.data.evTitle);
        $("#evRoom").html(args.e.data.evRoom);
        $("#evTeacher").html(args.e.data.evTeacher);
        $("#evModality").html(args.e.data.evModality);
        $("#evType").html(args.e.data.evType);
        $("#evDate").html(args.e.data.evDate);
        $("#evUE").html(args.e.data.evUE);
        $("#evECTS").html(args.e.data.evECTS);
        $("#evTheme").html(args.e.data.evTheme);
        $(".overlayBar").css("background-color", args.e.data.backColor);
        $("#evTitle").css("color", idealTextColor(args.e.data.backColor));
        displayOverlay("#overlayEventInfo");
    };

    if(online)
    {
        initEvents(data);
    }
    else
    {
        dp.events.list = data;
    }

    dp.init();
    $("#loadForm").remove();
    $("#controls").show();

    //Fix height
    var totalHeight = ($($("#planning").children("div")[1]).height() + 30);
    $("#planning").css("height", totalHeight + "px");
    $("body").css("height", (totalHeight + 10) + "px");
    $("#leftBar").css("height", (totalHeight - 30) + "px");

    $("#planning").show();
    $("#loader").hide();

    var columnWidthStr = $(".calendar_green_colheader").css("width");
    var columnWidth = parseInt(columnWidthStr.substr(0, columnWidthStr.length - 1));
    $(".menuDay").each(function(index)
    {
        $(this).css("width", columnWidth + "px");
        $(this).css("left", (45 + columnWidth * index) + "px");
    });
    updateTopBar();
    $("#topBarInternal").show();

    //Display hours
    $("#leftBar").html("");
    for(var i = 0; i < 24; i++)
    {
        $("#leftBar").append("<div class='leftBarRow'>" + i + "h</div>");
    }
    $("#leftBar").show();

    //Re-enable update button
    $('#reloadButton')[0].disabled = false;
    $('#retryButton')[0].disabled = false;
}

function initEvents(data)
{
    dp.events.list = [];
    var dataHtml = $(data);
    $(".infobulle", dataHtml).each(function(eventId)
    {
        //Full title
        var title = this.innerHTML.split("<br>", 1)[0];

        //Title array [UE, TITLE, ECTS]
        var titleStruct = title.split(": ", 2);
        titleStruct[2] = "";

        // ECTS
        var ectsMatch = titleStruct[1].match(/\([0-9]* ECTS\)/);
        if(ectsMatch != null)
        {
            titleStruct[2] = ectsMatch[0];
            titleStruct[1] = titleStruct[1].substr(0, titleStruct[1].length - ectsMatch[0].length);
        }


        //Event color
        var color = eventColors[Math.abs(title.hashCode() % eventColors.length)];

        var nEvent = {id: eventId, text: "", start: "", end: "", evTitle: titleStruct[1], evRoom: "", evTeacher: "Aucun", evType: "", evModality: "", evDate: "", evTheme: "Aucun de thème indiqué", evUE: titleStruct[0], evECTS: titleStruct[2], fontColor: idealTextColor(color), backColor: color};

        var lastKey = "";
        $("div", this).each(function(divId)
        {
            var text = this.innerHTML;

            // Register values from HTML code
            if(lastKey == " Modalite :  ")
            {
                nEvent.evModality = text;
            }
            else if(lastKey == " Type :  ")
            {
                nEvent.evType = text;
            }
            else if(lastKey == " Tuteur :  ")
            {
               nEvent.evTeacher = text;
            }
            else if(lastKey == " Salle :  ")
            {
               nEvent.evRoom = text;
            }
            else if(lastKey == " Thématique : ")
            {
               nEvent.evTheme = text;
            }
            else if(lastKey == " Date et horaire :  ")
            {
                nEvent.evDate = text;

                var dateData = text.split(" ");
                var dayData = dateData[0].split("/");
                nEvent.start = dayData[2] + "-" + dayData[1] + "-" + dayData[0] + "T" + dateData[1] + ":00"
                nEvent.end = dayData[2] + "-" + dayData[1] + "-" + dayData[0] + "T" + dateData[3] + ":00"
            }

            lastKey = text;
        });
        nEvent.text = nEvent.evTitle + "<br/>" +
        "<img class='eventIcon' src='./img/room.png'/><span class='eventLabel'>" + nEvent.evRoom + "</span><br/>" +
        "<img class='eventIcon' src='./img/teacher.png'/><span class='eventLabel'>" + nEvent.evTeacher + "</span><br/>" +
        "<img class='eventIcon' src='./img/ue.png'/><span class='eventLabel'>" + nEvent.evUE + "</span><br/>" +
        "<img class='eventIcon' src='./img/type.png'/><span class='eventLabel'>" + nEvent.evType + "</span>";
        dp.events.list.push(nEvent);
    });

    var permanentStorage = window.localStorage;
    permanentStorage.setItem("events", JSON.stringify(dp.events.list));
    permanentStorage.setItem("lastUpdate", new Date().getTime());
}

function scrollTopBar(e)
{
    var supportPageOffset = window.pageXOffset !== undefined;
    var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");

    window.addEventListener("scroll", function(e) {

    /* A full compatability script from MDN for gathering the x and y values of scroll: */
    var x = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
    var y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

    $("#topBar")[0].style.left = -x + "px";
    $("#topBar")[0].style.width = $(window).width() + x + "px";
  });
}

function lastCache()
{
    var permanentStorage = window.localStorage;
    var lastUpdate = new Date(parseInt(permanentStorage.getItem("lastUpdate")));
    return toTwoDigits(lastUpdate.getDate()) + "/" + toTwoDigits(lastUpdate.getMonth() + 1) + "/" + lastUpdate.getFullYear() +
    " " + toTwoDigits(lastUpdate.getHours()) + ":" + toTwoDigits(lastUpdate.getMinutes());
}

$(function()
{
    app.onDeviceReady();
});

//app.initialize();
