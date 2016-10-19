$(document).ready(function() {
  $.ajax({
    method: "GET",
    url: "https://skotix.nazwa.pl/domeny_www/b.legiec.eu/cytaty/get_quotes.php",
  })
  .done(function( msg ) {
    msg = (typeof(msg) == "object") ? msg : JSON.parse(msg);


    if( typeof(msg.error) == "undefined" ){
      console.log( msg );

      const $cont = $("main.container");
            $cont.html("");

      if( msg.length > 0 ){
        msg.forEach( (v) => {
          const $block = $("<blockquote></blockquote>");
                $block.append( $("<p></p>").html( v.text ) );
                $block.append( $("<footer></footer>").html( v.teacher ) );

          $block.appendTo( $cont );
        });
      } else {
        $cont.append( $("<div></div>").addClass("alert alert-danger").html( "Przepraszamy, ale narazie nie ma żadnych cytatów. Aby dodać własny kliknij <a href='add_cite.html'>tutaj</a>." ) );
      }
    } else {
      error( msg.error );
    }
  })
  .fail(function(){
    error();
  });
});


function error(msg){
  const $cont = $("main.container");
        $cont.html("");

  $cont.append( $("<div></div>").addClass("alert alert-danger").html( "Przepraszamy, ale wystąpił problem z pobraniem cytatów." ) );

  if( typeof(msg) != "undefined" ){
    console.error( "a", msg );
  }
}
