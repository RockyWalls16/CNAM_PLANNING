var app =
{
    // Application Constructor
    initialize: function()
    {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function()
    {
        console.log("Ready");

        $("#loadForm").submit(function(e)
        {
            e.preventDefault();
            $("#loadForm").hide();
            console.log("Submitted");
            loadPlanning();
        });

        $("#previous").click(function(e)
        {
            dp.startDate = dp.startDate.addDays(-7);
            dp.update();
        });

        $("#next").click(function(e)
        {
            dp.startDate = dp.startDate.addDays(7);
            dp.update();
        });
    },
};

var planningAdress = "https://iscople.gescicca.net/Planning.aspx";
var dp;

function loadPlanning()
{
    $.post(planningAdress, {uid: "9bd54ce86a0f1b1810166554a9ff903a", code_scolarite:"NAQ400940", cr:"NAQ"}, function(data)
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
        dp.initScrollPos = '320';
        initEvents(data);

        dp.init();
        $("#loadForm").remove();
        $("#controls").show();
        $("#planning").show();
        $("#loader").hide();

    }).fail(function(error)
    {
        $("#planning").html("Impossible de charger le planning...");
    });
}

function initEvents(data)
{
    dp.events.list = [];
    var dataHtml = $(data);
    $(".infobulle", dataHtml).each(function(eventId)
    {
        var title = this.innerHTML.split("<br>", 1)[0];
        var titleStruct = title.split(": ", 2);

        var nEvent = {id: eventId, start: "", end: "", text: titleStruct[1]};

        if(title.length >= 6)
        {
            var red = (title.charCodeAt(0) + title.charCodeAt(1)) % 128 + 64;
            var green = (title.charCodeAt(2) + title.charCodeAt(3)) % 128 + 64;
            var blue = (title.charCodeAt(4) + title.charCodeAt(5)) % 128 + 64;

            nEvent.backColor = rgbToHex(red, green, blue);
        }

        $("div", this).each(function(divId)
        {
            var text = this.innerHTML;

            // Check is date
            if(text.match(/[0-9]*\/[0-9]*\/[0-9]* [0-9]*:[0-9]* - [0-9]*:[0-9]*/))
            {
                var dateData = text.split(" ");
                var dayData = dateData[0].split("/");
                nEvent.start = dayData[2] + "-" + dayData[1] + "-" + dayData[0] + "T" + dateData[1] + ":00"
                nEvent.end = dayData[2] + "-" + dayData[1] + "-" + dayData[0] + "T" + dateData[3] + ":00"
            }
        });
        dp.events.list.push(nEvent);
    });
}

function componentToHex(c)
{
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b)
{
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

$(function()
{
    app.onDeviceReady();
});

//app.initialize();
