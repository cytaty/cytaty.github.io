$(document).ready(function() {
  $.ajax({
    method: "GET",
    url: "http://192.168.92.209/cytaty.github.io/server/get_teachers.php"
  })
  .done(function( msg ) {
    $("select#teacher").html("");

    for( let k in msg ){
      if (msg.hasOwnProperty(k)) {
        $("select#teacher").append( $("<option></option>").html(msg[k].name).attr("id", msg[k].id) );
      }
    }

    $("form").submit(function(e){
      const data = $(this).serializeArray();
      let dataToSend = {};

      dataToSend.text = $("#text").val();
      dataToSend.teacher = $("#teacher option:selected").attr("id");
      dataToSend.date = $("#date").val();

      $.ajax({
        method: "GET",
        url: "http://192.168.92.209/cytaty.github.io/server/add_quote.php",
        data: dataToSend
      })
      .done(function( msg ) {
        if( typeof(msg.error) == "undefined" ){
          const $cont = $("main.container");

          $cont.find(".alert").remove();
          $cont.prepend( $("<div></div>").addClass("alert alert-success").html( "Wysłano cytat do zaakceptowania." ) );

          $("textarea#text, input#date").val("");
          $("select option:selected").prop("selected", false);
        } else {
          error( msg );
        }
      });

      return false;
    });
  });
});

function error(msg){
  const $cont = $("main.container");
        $cont.html("");

  $cont.append( $("<div></div>").addClass("alert alert-danger").html( "Przepraszamy, ale wystąpił problem z pobraniem cytatów.") );

  if( typeof(msg) != "undefined" ){
    console.log( msg );
  }
}
