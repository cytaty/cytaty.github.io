$(document).ready(function() {
  $.ajax({
    method: "POST",
    url: "https://skotix.nazwa.pl/domeny_www/b.legiec.eu/cytaty/get_teachers.php"
  })
  .done(function( msg ) {
    $("select#teacher").html("");

    if( Object.getOwnPropertyNames(msg).length > 0 ){
      for( let k in msg ){
        if (msg.hasOwnProperty(k)) {
          $("select#teacher").append( $("<option></option>").html(msg[k].name).attr("id", msg[k].id) );
        }
      }
    } else {
      $("main.container").html( $("<div></div>").addClass("alert alert-danger").html( "Nie znaleziono żadnych nauczycieli. Jeśli chcesz jakiegoś dodać to kliknij <a href='add_teacher.html'>tutaj</html>" ) );
    }

    $("form").submit(function(e){
      const data = $(this).serializeArray();
      let dataToSend = {};

      dataToSend.text = $("#text").val();
      dataToSend.teacher = $("#teacher option:selected").attr("id");
      dataToSend.date = $("#date").val();
      dataToSend.name = $("#name").val();

      $.ajax({
        method: "POST",
        url: "https://skotix.nazwa.pl/domeny_www/b.legiec.eu/cytaty/add_quote.php",
        data: dataToSend
      })
      .done(function( msg ) {
        msg = (typeof(msg) == "object") ? msg : JSON.parse(msg);
        const $cont = $("main.container");

        if( typeof(msg.error) == "undefined" ){
          $cont.find(".alert").remove();
          $cont.prepend( $("<div></div>").addClass("alert alert-success").html( "Wysłano cytat do zaakceptowania." ) );

          $("textarea#text, input#date, input#name").val("");
          $("select option:selected").prop("selected", false);
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
});

function error(msg){
  const $cont = $("main.container");
        $cont.html("");

  $cont.append( $("<div></div>").addClass("alert alert-danger").html( "Przepraszamy, ale wystąpił problem z pobraniem cytatów.") );

  if( typeof(msg) != "undefined" ){
    console.log( msg, msg.error_code );
  }
}
