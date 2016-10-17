$(document).ready(function() {
  $.ajax({
    method: "GET",
    url: "http://192.168.92.209/cytaty.github.io/server/get_teachers.php"
  })
  .done(function( msg ) {
    $("select#teacher").html("");

    for( let k in msg ){
      if (msg.hasOwnProperty(k)) {
        $("select#teacher").append( $("<option></option>").html(msg[k].name) );
      }
    }

    $("form").submit(function(e){
      const data = $(this).serializeArray();
      let dataToSend = {};


      for (var k in data) {
        if (data.hasOwnProperty(k)) {
          dataToSend[data[k].name] = data[k].value;
        }
      }

      $.ajax({
        method: "GET",
        url: "http://192.168.92.209/cytaty.github.io/server/add_quote.php",
        data: dataToSend
      })
      .done(function( msg ) {
        console.log( msg );
      });

      return false;
    });
  });
});
