(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"/usr/src/app/src/js/script.js":[function(require,module,exports){
"use strict";

if (navigator.standalone) {
  $("body #app > div > main").addClass("standalone-main");
  $("html").addClass("standalone");
  bouncefix.add("standalone-main");
}

$(".more-info nav").click(function () {
  var $this = $(this);
  var $i = $this.find("i");
  var $text = $this.find(".expand-text");
  var $aside = $(this).siblings("aside");

  if ($aside.css("display") !== "none") {
    $aside.slideUp(300);
    $i.text("expand_more");
    $text.text("POKAŻ WIĘCEJ INFORMACJI");
  } else {
    $aside.slideDown(300);
    $i.text("expand_less");
    $text.text("POKAŻ MNIEJ INFORMACJI");
  }
});

$(document).on(document.ontouchstart !== null ? "mousedown" : "touchstart", ".blink", function () {
  var size = Math.min($(this).width(), $(this).height());
  var $blink = $("<div></div>").addClass("blink-blink").css({
    "width": size,
    "height": size
  });

  $(this).append($blink).addClass("blink-parent");

  $(this).one(document.ontouchstart !== null ? "mouseup" : "touchend", function () {
    var $this = $(this);
    $blink.addClass("blink-remove");
    $blink.on("transitionend", function () {
      $(this).remove();
      $this.removeClass("blink-parent");
    });
  });
});

$(document).on("click", ".blink-big", function (e) {
  var coordX = e.pageX - $(this).offset().left;
  var coordY = e.pageY - $(this).offset().top;

  var size = Math.max($(this).width(), $(this).height()) / 2;
  var $blink = $("<div></div>").addClass("blink-big-blink").css({
    "width": size,
    "height": size,
    "top": coordY - size / 2,
    "left": coordX - size / 2
  });

  $(this).append($blink).addClass("blink-parent-big");

  var $this = $(this);

  $blink.one("animationend", function () {
    $(this).remove();
    $this.removeClass("blink-parent-big");
  });
});

$("body").click(function (e) {
  var $tar = $(e.target);
  var add = false;
  var $fab = $(".fab-main");

  if ($fab.hasClass("clicked")) {
    add = false;
  } else if ($tar.parents(".fab-main").hasClass("fab-main") || $tar.hasClass("fab-main")) {
    add = true;
  }

  if (add) {
    $(".fab-main").addClass("clicked");
  } else {
    $(".fab-main").removeClass("clicked");
  }
});

var $txt = $(".form-group textarea");
var $hiddenDiv = $("<div></div>");
var content = null;

$hiddenDiv.css({
  "display": "none",
  "white-space": "pre-wrap",
  "word-wrap": "break-word",
  "overflow-wrap": "break-word",
  "padding": "7px 0",
  "font-size": "16px",
  "line-height": 1.42857143
});

$("body").append($hiddenDiv);

$txt.on("keyup", function () {
  content = $(this).val();

  content = content.replace(/\n/g, "<br>");
  $hiddenDiv.html(content + "<br><br style=\"line-height: 3px;\">");

  $(this).css("height", $hiddenDiv.height());
});

},{}]},{},["/usr/src/app/src/js/script.js"])

//# sourceMappingURL=script.js.map
