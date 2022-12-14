
function resizeWindow() {

    $(".card").height($(window).height() - $(".card").offset().top -20)
}

$(function () {

    $(window).resize(resizeWindow).trigger("resize");

    // Every time a modal is shown, if it has an autofocus element, focus on it.
    $(".modal").on("shown.bs.modal", function() {
        $(this).find("[autofocus]").focus();
    });

    $("#form-new-player").validate({
        errorElement: "small",
        errorClass: "error text-danger text-small",
        rules: {
            playerName: {
                required: true,
                // Using the normalizer to trim the value of the element
                // before validating it.
                //
                // The value of `this` inside the `normalizer` is the corresponding
                // DOMElement. In this example, `this` references the `username` element.
                normalizer: function (value) {
                    return $.trim(value);
                }
            }
        }
    });

    $("#form-new-room").validate({
        errorElement: "small",
        errorClass: "error text-danger text-small",
        rules: {
            roomName: {
                required: true,
                normalizer: function (value) {
                    return $.trim(value);
                }
            }
        }
    });
});
