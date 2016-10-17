$(document).ready(function() {
  $.ajax({
    method: "GET",
    url: "http://192.168.92.209/cytaty.github.io/server/get_quotes.php",
  })
  .done(function( msg ) {
    const $cont = $("main.container");
          $cont.html("");

    msg.forEach( (v) => {
      const $block = $("<blockquote></blockquote>");
            $block.append( $("<p></p>").html( v.text ) );
            $block.append( $("<footer></footer>").html( v.teacher ) );

      $block.appendTo( $cont );
    });
  });
});
