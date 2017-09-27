var loginAdress = "https://lecnam.net/";
var loginAdressRedirect = "https://sts.lecnam.net/idp/profile/SAML2/Redirect/SSO";
var disconnectAdress = "https://sts.lecnam.net/idp/profile/Logout";

function showLoginPage()
{
    var trulyLogged = false;

    $("#page1").show();
    $("iframe")[0].src = loginAdress;

    //Handle iframe load
    $("iframe")[0].onload = function(e)
    {
        //Resize iframe
        $("iframe").height($(document).height());

        try
        {
            var iframe = $("iframe").contents();
            var url = $("iframe")[0].contentWindow.location.href;
            var uidElement = $(".JclickApp", iframe);
            console.log(url);
            console.log(uidElement, trulyLogged);

            //Fix already logged
            if(!trulyLogged && uidElement.length != 0 && !url.startsWith(disconnectAdress))
            {
                console.log("Disconnect now");
                $("iframe")[0].src = logoutAdress;
            }

            //Main page
            if(uidElement.length != 0 && trulyLogged)
            {
                console.log("Main page");
                uidElement = $(".JclickApp", $("iframe").contents());
                console.log(uidElement);
                console.log(uidElement.length);

                for(var i = 0; i < uidElement.length; i++)
                {
                    var link = String($(uidElement[i]).attr("data-lien"));

                    //Locate right link
                    if(link.startsWith(planningAdress))
                    {
                        console.log("Found ids");
                        var linkParams = link.match(/.*uid=(.*)&code_scolarite=(.*)&cr=(.*)/);
                        var permanentStorage = window.localStorage;
                        permanentStorage.setItem("uid", linkParams[1]);
                        permanentStorage.setItem("cdsc", linkParams[2]);
                        permanentStorage.setItem("cr", linkParams[3]);
                        app.onLogged();
                    }
                }

            }//Login page
            else if(url.startsWith(loginAdress) || url.startsWith(loginAdressRedirect))
            {
                console.log("Login page");
                trulyLogged = true;
            }
            //Redirect to login
            else if(url.startsWith(disconnectAdress))
            {
                trulyLogged = false;
                $("iframe")[0].src = loginAdress;
            }
        }
        catch (e)
        {
            console.error(e);
        }
    };
}
