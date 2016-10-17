$(document).ready(function() {
  $("form").submit(function(e){
    console.log( $(this).serialize() );
    return false;
  });


  $.ajax({
    method: "GET",
    url: "http://192.168.92.209/cytaty.github.io/server/add_quote.php",
    data: {"test": ":)asd"}
  })
  .done(function( msg ) {
    console.log( msg );
  });
});
