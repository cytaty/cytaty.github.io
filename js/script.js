if (navigator.standalone) {
  $("body #app > div > main").addClass("standalone-main");
  $("html").addClass("standalone");
  bouncefix.add("standalone-main");
}

$(".more-info nav").click(function() {
  const $this = $(this);
  const $i = $this.find("i");
  const $text = $this.find(".expand-text");
  const $aside = $(this).siblings("aside");

  if ( $aside.css("display") !== "none" ) {
    $aside.slideUp(300);
    $i.text("expand_more");
    $text.text("POKAŻ WIĘCEJ INFORMACJI");
  } else {
    $aside.slideDown(300);
    $i.text("expand_less");
    $text.text("POKAŻ MNIEJ INFORMACJI");
  }
});

$(document).on((document.ontouchstart !== null) ? "mousedown" : "touchstart", ".blink", function() {
  const size = Math.min( $(this).width(), $(this).height() );
  const $blink = $("<div></div>").addClass("blink-blink").css({
    "width": size,
    "height": size,
  });

  $(this).append( $blink ).addClass("blink-parent");

  $(this).one((document.ontouchstart !== null) ? "mouseup" : "touchend", function() {
    const $this = $(this);
    $blink.addClass("blink-remove");
    $blink.on("transitionend", function() {
      $(this).remove();
      $this.removeClass("blink-parent");
    });
  });
});

$(document).on("click", ".blink-big", function(e) {
  const coordX = e.pageX - $(this).offset().left;
  const coordY = e.pageY - $(this).offset().top;

  const size = Math.max( $(this).width(), $(this).height() ) / 2;
  const $blink = $("<div></div>").addClass("blink-big-blink").css({
    "width": size,
    "height": size,
    "top": coordY - (size / 2),
    "left": coordX - (size / 2),
  });

  $(this).append( $blink ).addClass("blink-parent-big");

  const $this = $(this);

  $blink.one("animationend", function() {
    $(this).remove();
    $this.removeClass("blink-parent-big");
  });
});

$("body").click((e) => {
  const $tar = $(e.target);
  let add = false;
  const $fab = $(".fab-main");


  if ( $fab.hasClass("clicked") ) {
    add = false;
  } else if ( $tar.parents(".fab-main").hasClass("fab-main") || $tar.hasClass("fab-main") ) {
    add = true;
  }

  if ( add ) {
    $(".fab-main").addClass("clicked");
  } else {
    $(".fab-main").removeClass("clicked");
  }
});


const $txt = $(".form-group textarea");
const $hiddenDiv = $("<div></div>");
let content = null;

$hiddenDiv.css({
  "display": "none",
  "white-space": "pre-wrap",
  "word-wrap": "break-word",
  "overflow-wrap": "break-word",
  "padding": "7px 0",
  "font-size": "16px",
  "line-height": 1.42857143,
});

$("body").append($hiddenDiv);

$txt.on("keyup", function() {
  content = $(this).val();

  content = content.replace(/\n/g, "<br>");
  $hiddenDiv.html(`${content}<br><br style="line-height: 3px;">`);

  $(this).css("height", $hiddenDiv.height());
});
