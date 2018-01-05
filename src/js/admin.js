$(document).ready(function() {
  $("blockquote span[contenteditable='true']").on("input", function(){
    const $parent = $(this).parent();
    $parent.removeClass("dirty");
    if( $(this).html() !== $(this).data("start") ){
      $parent.addClass("dirty");
    }
  });

  const acceptQuote = function(){
    const $parent = $(this).parents("blockquote");
    const text = $parent.find("span[contenteditable='true']").html();
    $parent.removeClass("dirty");

    if( $(this).html() !== $(this).data("start") ){
      const id = $parent.data("id");
      const dataToSend = {
        "text": text.replace(/<br>/g, "\n"),
        "id": id,
        "active": true
      };

      $.ajax({
        method: "POST",
        url: "update_quote.php",
        data: dataToSend
      })
      .done(function( msg ) {
        if( $parent.parent().hasClass("new-quotes") ){
          $parent.remove();
        }

        $("blockquote[data-id='"+id+"']")
          .removeClass("inactive")
          .find("span[contenteditable='true']").html( text );
      });
    }
  }

  $("blockquote.quote .controls .btn-success").on("click", acceptQuote);

  $("blockquote.quote .controls .btn-danger").on("click", function(){
    const $parent = $(this).parents("blockquote");
    $parent.removeClass("dirty");

    if( $(this).html() !== $(this).data("start") ){
      const id = $parent.data("id");
      const dataToSend = {
        "id": id,
        "active": false
      };

      $.ajax({
        method: "POST",
        url: "update_quote.php",
        data: dataToSend
      })
      .done(function( msg ) {
        console.log( msg );
        $(this).addClass("inactive");
        $("blockquote[data-id='"+id+"']").addClass("inactive");
      });
    }
  });

  $("blockquote.quote .controls .btn-warning").on("click", function(){
    const $parent = $(this).parents("blockquote");
    const text = $parent.find("span[contenteditable='true']").html();
    $parent.removeClass("dirty");

    if( $(this).html() !== $(this).data("start") ){
      const id = $parent.data("id");
      const dataToSend = {
        "text": text.replace(/<br>/g, "\n"),
        "id": id
      };

      $.ajax({
        method: "POST",
        url: "update_quote.php",
        data: dataToSend
      })
      .done(function( msg ) {
        $("blockquote[data-id='"+id+"']")
          .find("span[contenteditable='true']").html( text );
      });
    }
  });

  const removeQuote = function() {
    const $parent = $(this).parents("blockquote");

    if( $(this).html() !== $(this).data("start") ){
      const id = $parent.data("id");
      const dataToSend = {
        "id": id
      };

      $.ajax({
        method: "POST",
        url: "remove_quote.php",
        data: dataToSend
      })
      .done(function( msg ) {
        $("blockquote[data-id='"+id+"']").remove();
        $parent.remove();
      });
    }
  }

  $("blockquote.quote .controls .btn-info").on("click", function(){
    if( confirm("Czy na pewno chcesz usunąć ten cytat? Ta opcja jest nieodwracalna!") ){
      removeQuote.call(this)
    }
  });

  $("#deny-all").on("click", function() {
    if( confirm("Czy na pewno chcesz usunąć wszystkie cytaty? Ta opcja jest nieodwracalna!") ){
      $(".new-quotes .quote").each( function() {
        removeQuote.call( $(this).find(".btn-info")[0] )
      } );
    }
  })

  $("#accept-all").on("click", function() {
    $(".new-quotes .quote").each( function() {
      acceptQuote.call( $(this).find(".btn-info")[0] )
    } );
  })
});
