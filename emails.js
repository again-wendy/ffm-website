const buildSelfServiceFFMEmail = function(lang, email, companyName, companyType, firstName, lastName, emailNewsletters, emailProduct, emailContact) {
    let output = `
    <!doctype html>
    <html>
    <head>
    <title></title>
    <style type="text/css">
    /* CLIENT-SPECIFIC STYLES */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }
    
    /* RESET STYLES */
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
    
    /* iOS BLUE LINKS */
    a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
    }
    
    /* MOBILE STYLES */
    @media screen and (max-width: 600px) {
      .img-max {
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
      }
    
      .max-width {
        max-width: 100% !important;
      }
    
      .mobile-wrapper {
        width: 85% !important;
        max-width: 85% !important;
      }
    
      .mobile-padding {
        padding-left: 5% !important;
        padding-right: 5% !important;
      }
    }
    
    /* ANDROID CENTER FIX */
    div[style*="margin: 16px 0;"] { margin: 0 !important; }
    </style>
    </head>
    <body style="margin: 0 !important; padding: 0 !important; background-color: #ffffff;" bgcolor="#ffffff">
    
    <!-- HIDDEN PREHEADER TEXT -->
    <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Open Sans, Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        
    </div>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" height="100%" valign="top" width="100%" bgcolor="#f6f6f6" style="padding: 50px 15px;" class="mobile-padding">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                <tr>
                <td align="center" valign="top" width="600">
                <![endif]-->
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                    <tr>
                        <td align="center" valign="top" style="padding: 0 0 25px 0; font-family: Open Sans, Helvetica, Arial, sans-serif;">
                            <table cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center" bgcolor="#ffffff" style="border-radius: 0 0 3px 3px; padding: 25px;">
                                        <table cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td align="center" style="font-family: Open Sans, Helvetica, Arial, sans-serif;" mc:edit="Article #1 Copy">
                                                    <h2 style="font-size: 20px; color: #444444; margin: 0; padding-bottom: 10px;">Iemand wil graag aangesloten worden!</h2>
                                                    <p style="color: #747474; font-size: 16px; line-height: 24px; margin: 0;">
                                                      De volgende persoon heeft een aanvraag voor aansluiten gedaan:
                                                    </p>
                                                    <ul style="list-style:none; text-align:left; font-size: 14px; font-family: Open Sans, Helvetica, Arial, sans-serif; color: #999999;">
                                                        <li style="padding-bottom: 15px;">Gekozen taal: ${lang}</li>
                                                        <li style="padding-bottom: 5px;">Email: ${email}</li>
                                                        <li style="padding-bottom: 5px;">Bedrijfsnaam: ${companyName}</li>
                                                        <li style="padding-bottom: 5px;">Bedrijfstype: ${companyType}</li>
                                                        <li style="padding-bottom: 5px;">Voornaam: ${firstName}</li>
                                                        <li style="padding-bottom: 15px;">Achternaam: ${lastName}</li>
                                                        <li style="padding-bottom: 5px;">Wil nieuwsbrieven ontvangen: ${emailNewsletters}</li>
                                                        <li style="padding-bottom: 5px;">Wil product updates ontvangen: ${emailProduct}</li>
                                                        <li style="padding-bottom: 5px;">Wil gericht individueel contact: ${emailContact}</li>
                                                    </ul>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                          </table>
                        </td>
                    </tr>
                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
            </td>
        </tr>
        <tr>
            <td align="center" height="100%" valign="top" width="100%" bgcolor="#f6f6f6" style="padding: 0 15px 40px 15px;">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                <tr>
                <td align="center" valign="top" width="600">
                <![endif]-->
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                    <tr>
                        <td align="center" valign="top" style="padding: 0;">
                            <img src="http://flexforcemonkey.com/public/favicons/android-icon-192x192.png" width="45" border="0" style="display: block;" mc:edit="Logo Footer">
                        </td>
                    </tr>
                    <tr>
                        <td align="center" valign="top" style="padding: 0; font-family: Open Sans, Helvetica, Arial, sans-serif; color: #999999;" mc:edit="Footer">
                            <p style="font-size: 12px; line-height: 16px;">
                              FlexForceMonkey<br>
                              Postbus 115 6800 AC<br>
                              Arnhem, The Netherlands
    
                              <br><br>
                            </p>
                        </td>
                    </tr>
                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
            </td>
        </tr>
    </table>
    </body>
    </html>    
    `;
    return output;
}

const buildSelfServiceUserEmailNL = function() {
    let output = `
    <!doctype html>
    <html>
    <head>
    <title></title>
    <style type="text/css">
    /* CLIENT-SPECIFIC STYLES */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }

    /* RESET STYLES */
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }

    /* iOS BLUE LINKS */
    a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
    }

    /* MOBILE STYLES */
    @media screen and (max-width: 600px) {
    .img-max {
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
    }

    .max-width {
        max-width: 100% !important;
    }

    .mobile-wrapper {
        width: 85% !important;
        max-width: 85% !important;
    }

    .mobile-padding {
        padding-left: 5% !important;
        padding-right: 5% !important;
    }
    }

    /* ANDROID CENTER FIX */
    div[style*="margin: 16px 0;"] { margin: 0 !important; }
    </style>
    </head>
    <body style="margin: 0 !important; padding: 0 !important; background-color: #ffffff;" bgcolor="#ffffff">

    <!-- HIDDEN PREHEADER TEXT -->
    <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Open Sans, Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
       
    </div>

    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" height="100%" valign="top" width="100%" bgcolor="#f6f6f6" style="padding: 50px 15px;" class="mobile-padding">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                <tr>
                <td align="center" valign="top" width="600">
                <![endif]-->
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                    <tr>
                        <td align="center" valign="top" style="padding: 0 0 25px 0; font-family: Open Sans, Helvetica, Arial, sans-serif;">
                            <table cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center" bgcolor="#ffffff" style="border-radius: 0 0 3px 3px; padding: 25px;">
                                        <table cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td align="center" style="font-family: Open Sans, Helvetica, Arial, sans-serif;" mc:edit="Article #1 Copy">
                                                    <h2 style="font-size: 20px; color: #444444; margin: 0; padding-bottom: 10px;">Bedankt voor je aanvraag!</h2>
                                                    <p style="color: #747474; font-size: 16px; line-height: 24px; margin: 0;">
                                                        We gaan aan de slag om jouw account op te zetten. Dit kan een paar uur in beslag nemen en we zullen je een bericht doen wanneer dit klaar is!
                                                        <br><br>
                                                        Met vriendelijke groet,<br>
                                                        Het FlexForceMonkey team
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                        </table>
                        </td>
                    </tr>
                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
            </td>
        </tr>
        <tr>
            <td align="center" height="100%" valign="top" width="100%" bgcolor="#f6f6f6" style="padding: 0 15px 40px 15px;">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                <tr>
                <td align="center" valign="top" width="600">
                <![endif]-->
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                    <tr>
                        <td align="center" valign="top" style="padding: 0;">
                            <img src="http://flexforcemonkey.com/public/favicons/android-icon-192x192.png" width="45" border="0" style="display: block;" mc:edit="Logo Footer">
                        </td>
                    </tr>
                    <tr>
                        <td align="center" valign="top" style="padding: 0; font-family: Open Sans, Helvetica, Arial, sans-serif; color: #999999;" mc:edit="Footer">
                            <p style="font-size: 12px; line-height: 16px;">
                            FlexForceMonkey<br>
                            Postbus 115 6800 AC<br>
                            Arnhem, The Netherlands

                            <br><br>
                            </p>
                        </td>
                    </tr>
                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
            </td>
        </tr>
    </table>
    </body>
    </html>
    `
    return output;
}

const buildSelfServiceUserEmailEN = function() {
    let output = `
    <!doctype html>
    <html>
    <head>
    <title></title>
    <style type="text/css">
    /* CLIENT-SPECIFIC STYLES */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }

    /* RESET STYLES */
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }

    /* iOS BLUE LINKS */
    a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
    }

    /* MOBILE STYLES */
    @media screen and (max-width: 600px) {
    .img-max {
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
    }

    .max-width {
        max-width: 100% !important;
    }

    .mobile-wrapper {
        width: 85% !important;
        max-width: 85% !important;
    }

    .mobile-padding {
        padding-left: 5% !important;
        padding-right: 5% !important;
    }
    }

    /* ANDROID CENTER FIX */
    div[style*="margin: 16px 0;"] { margin: 0 !important; }
    </style>
    </head>
    <body style="margin: 0 !important; padding: 0 !important; background-color: #ffffff;" bgcolor="#ffffff">

    <!-- HIDDEN PREHEADER TEXT -->
    <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Open Sans, Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
       
    </div>

    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" height="100%" valign="top" width="100%" bgcolor="#f6f6f6" style="padding: 50px 15px;" class="mobile-padding">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                <tr>
                <td align="center" valign="top" width="600">
                <![endif]-->
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                    <tr>
                        <td align="center" valign="top" style="padding: 0 0 25px 0; font-family: Open Sans, Helvetica, Arial, sans-serif;">
                            <table cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center" bgcolor="#ffffff" style="border-radius: 0 0 3px 3px; padding: 25px;">
                                        <table cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td align="center" style="font-family: Open Sans, Helvetica, Arial, sans-serif;" mc:edit="Article #1 Copy">
                                                    <h2 style="font-size: 20px; color: #444444; margin: 0; padding-bottom: 10px;">Thanks for your request!</h2>
                                                    <p style="color: #747474; font-size: 16px; line-height: 24px; margin: 0;">
                                                        We'll get started with setting up your account. This may take a few hours. We'll notify when this is done!
                                                        <br><br>
                                                        Best regards,<br>
                                                        The FlexForceMonkey team
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                        </table>
                        </td>
                    </tr>
                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
            </td>
        </tr>
        <tr>
            <td align="center" height="100%" valign="top" width="100%" bgcolor="#f6f6f6" style="padding: 0 15px 40px 15px;">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                <tr>
                <td align="center" valign="top" width="600">
                <![endif]-->
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                    <tr>
                        <td align="center" valign="top" style="padding: 0;">
                            <img src="http://flexforcemonkey.com/public/favicons/android-icon-192x192.png" width="45" border="0" style="display: block;" mc:edit="Logo Footer">
                        </td>
                    </tr>
                    <tr>
                        <td align="center" valign="top" style="padding: 0; font-family: Open Sans, Helvetica, Arial, sans-serif; color: #999999;" mc:edit="Footer">
                            <p style="font-size: 12px; line-height: 16px;">
                            FlexForceMonkey<br>
                            Postbus 115 6800 AC<br>
                            Arnhem, The Netherlands

                            <br><br>
                            </p>
                        </td>
                    </tr>
                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
            </td>
        </tr>
    </table>
    </body>
    </html>
    `
    return output;
}

module.exports = {
    buildSelfServiceFFMEmail,
    buildSelfServiceUserEmailNL,
    buildSelfServiceUserEmailEN
}