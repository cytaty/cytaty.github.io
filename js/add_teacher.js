$(document).ready(function() {
  $("form").submit(function(e){
    const data = $(this).serializeArray();
    let dataToSend = {};

    dataToSend.name = $("#name").val();

    $.ajax({
      method: "GET",
      url: "http://192.168.92.209/cytaty.github.io/server/add_teacher.php",
      data: dataToSend
    })
    .done(function( msg ) {
      console.log( msg );
      msg = (typeof(msg) == "object") ? msg : JSON.parse(msg);
      const $cont = $("main.container");

      if( typeof(msg.error) == "undefined" ){
        $cont.find(".alert").remove();
        $cont.prepend( $("<div></div>").addClass("alert alert-success").html( "Dodano nauczyciela." ) );

        $("#name").val("");
      } else if(parseInt(msg.error_code) !== 0) {
        $cont.find(".alert").remove();
        $cont.prepend( $("<div></div>").addClass("alert alert-warning").html( msg.error ) );
        console.warn( msg.error );
      } else {
        error( msg );
      }
    });

    return false;
  });
});

function error(msg){
  const $cont = $("main.container");
        $cont.html("");

  $cont.append( $("<div></div>").addClass("alert alert-danger").html( "Przepraszamy, ale wystąpił problem z pobraniem cytatów.") );

  if( typeof(msg) != "undefined" ){
    console.log( msg, msg.error_code );
  }
}
