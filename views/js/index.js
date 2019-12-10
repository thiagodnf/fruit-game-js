
function showToast(type, title, text) {
   
    $.toast({
        title: title,
        content: text,
        type: type,
        delay: 5000,
    });
}

function showError(text){
    showToast("error", "Error", text);
}

$(function(){

    $(".flash-message").each(function(){
        showError($(this).text());
    });

    var $rooms = $(".rooms");
    
    $rooms.height(6 * 50);
    
    $(".list-group-item").click(function(){

        if ($(this).hasClass("active")) {
            $(this).removeClass("active");
        } else {

            $(".list-group-item").removeClass("active");

            $(this).addClass("active");
        }
    });

    $(".btn-play-now").click(function(event){
        event.preventDefault();

        var $selectedRoom = $(".rooms .list-group-item.active");

        if (!$selectedRoom || $selectedRoom.length === 0) {
            showError("Choose a room before playing");
            return;
        }

        var roomId = $selectedRoom.data("room-id");
        var roomName = $selectedRoom.find(".room-name").text();

        $("input[name='roomId']").val(roomId);
        $("#modal-play-now .room-name").text(roomName);

        $("#modal-play-now").modal("show");

        return false;
    });

    $("#form-play-now").submit(function(){
        $("#modal-play-now").modal("hide");
    });

    $("#form-create-room").submit(function(){
        $("#modal-create-room").modal("hide");
    });

    $("#gameModeType").change(function () {
       
        if ($(this).val() == 'competitive') {
            $("label[for='gameModeValue']").text("Max Score");
        } else if ($(this).val() == 'timed') {
            $("label[for='gameModeValue']").text("Seconds");
        }
    });
})