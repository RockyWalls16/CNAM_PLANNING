function componentToHex(c)
{
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b)
{
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function toTwoDigits(value)
{
    if(value < 10)
    {
        return "0" + value;
    }
    return value;
}

String.prototype.hashCode = function()
{
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

String.prototype.startsWith = function(needle)
{
    return(this.indexOf(needle) == 0);
};

function idealTextColor(bgColor)
{

   var nThreshold = 105;
   var components = getRGBComponents(bgColor);
   var bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);

   return ((255 - bgDelta) < nThreshold) ? "#000000" : "#ffffff";
}

function getRGBComponents(color)
{
    var r = color.substring(1, 3);
    var g = color.substring(3, 5);
    var b = color.substring(5, 7);

    return {
       R: parseInt(r, 16),
       G: parseInt(g, 16),
       B: parseInt(b, 16)
    };
}
