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

    function render_template() {
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
    }


    $("[id^=template-]").click(function(obj) {
	alert(obj.currentTarget.id);
	var name = obj.currentTarget.id.substr(9);
	$.ajax({
	url: "/load/" + name,
	success: function(response) {
	  $('#template').val(response.body)
	  }
	})
    })

    function get_template(name) {
	$.ajax({
	url: "/load/" + name
	})
    }

    $('#convert').click(function() {
        render_template();
    });

    $('#template').on('change keyup paste', function() {
        render_template();
    });

    $('#values').on('change keyup paste', function() {
        render_template();
    });

    $("#preview").click(function() {
    	$.ajax({url: "/template/",
		type: "POST",
		data: JSON.stringify({"csrf_token": $('input[name="csrf_token"]').val(),
		       "templateName": $("#templateName").html().substr(10),
		       "values": $('#values').val(),
		       "templateContent": $("#template").val(),
		       "preview": true}
		),
	    	contentType: "application/json",
		success: function(response) {
			 window.open(response, '_blank');
                    },
		statusCode: {
		    400: function(response) { showalert("Browser refresh required", "alert-warning")},
		    412: function(response) {
                         showalert(response.responseText, "alert-warning")},
		    500: function(response) { showalert("Server error!", "alert-danger")}
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

    render_template();
});
