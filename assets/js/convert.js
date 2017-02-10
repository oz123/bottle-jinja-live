$(document).ready(function(){

    function showalert(message, alerttype) {
        $('#alert_placeholder').append('<div id="alertdiv" class="alert ' +  alerttype + '"><a class="close" data-dismiss="alert">×</a><span>'+message+'</span></div>')

        setTimeout(function() {
        // this will automatically close the
        // alert and remove this if the users doesn't
        //  close it in 5 secs
           $("#alertdiv").remove();
           }, 3000);
    }

    $('#clear').click(function() {
        $('#render').val('');
        $('#values').val('');
        $('#render').html('');
    });

    $('#convert').click(function() {
        var is_checked_showwhitespaces = $('input[name="showwhitespaces"]').is(':checked') ? 1:0;
	$.ajax({
        url: "/validate-jinja/",
        type: "POST",
        data: JSON.stringify({"template": $('#template').val(),
                              "values": $('#values').val(),
                              "showwhitespaces": is_checked_showwhitespaces,
                              "csrf_token": $('input[name="csrf_token"]').val(),
                             }),
        contentType: "application/json",
        success: function(response) {
	    response = response.replace(/•/g, '<span class="whitespace">•</span>');
            // Display the answer
            $('#render').html(response);
            }

        });
    });

    $("#save").click(function() {
    	$.ajax({url: "/template/",
		type: "POST",
		data: JSON.stringify({"csrf_token": $('input[name="csrf_token"]').val(),
		       "templateName": $('select[name="templateName"]').val(),
		       "templateContent": $("#template").val()}),
	    	contentType: "application/json",
		success: function(response) {
                    showalert(response, "alert-success")
                    },
		statusCode: {
		    400: function(response) { showalert("Browser refresh required", "alert-warning")},
		    412: function(response) {
                         showalert(response.responseText, "alert-warning")},
		    500: function(response) { showalert("Server error!", "alert-danger")}
                }
                });
    });
});
