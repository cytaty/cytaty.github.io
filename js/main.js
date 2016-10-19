$(document).ready(function() {
  $.ajax({
    method: "GET",
    url: "http://192.168.92.209/cytaty.github.io/server/get_quotes.php",
  })
  .done(function( msg ) {
    console.log( msg );
    msg = (typeof(msg) == "object") ? msg : JSON.parse(msg);


    if( typeof(msg.error) == "undefined" ){
      console.log( msg );
      const $cont = $("main.container");
            $cont.html("");

      msg.forEach( (v) => {
        const $block = $("<blockquote></blockquote>");
              $block.append( $("<p></p>").html( v.text ) );
              $block.append( $("<footer></footer>").html( v.teacher ) );

        $block.appendTo( $cont );
      });
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
