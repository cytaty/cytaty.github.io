<?php
  session_start();

  require_once 'passwords.php';

  $lastLoggedIn = strtotime( "2016-10-08 01:00:00" );

  try {
    $db = new PDO('mysql:host='.HOST.';dbname='.DATABASE.';charset=utf8mb4', LOGIN, PASSWORD);

    if( isset($_POST["login"]) && isset($_POST["password"]) ){
      $passwordQuery = $db->prepare("SELECT `password` FROM `users` WHERE `username` = :user");
      $passwordQuery->execute(array(":user" => $_POST["login"]));
      $password = $passwordQuery->fetchAll(PDO::FETCH_ASSOC);
    }

    $quotesQuery = $db->prepare("SELECT * FROM `quotes` ORDER BY `id` DESC");
    $quotesQuery->execute();
    $quotes = $quotesQuery->fetchAll(PDO::FETCH_ASSOC);

  } catch (PDOException $e) {
    $error = array();
    $error["error"] = utf8_encode($e->getMessage());
    echo json_encode($error);
    die();
  }

  $_SESSION["error"] = false;

  if( isset($_POST["login"]) && isset($_POST["password"]) && count($password) == 1 ){
    if( password_verify($_POST["password"], $password[0]["password"]) ){
      $_SESSION["auth"] = true;
    } else {
      $_SESSION["error"] = true;
    }
  } else if( isset($password) && count($password) != 1 ){
    $_SESSION["error"] = true;
  }

  if( isset($_GET["logout"]) ){
    $_SESSION["auth"] = false;
  }




  include 'get_teachers.php';

  $teachersOut = $teachers;
  $teachers = array();

  foreach ($teachersOut as $key => $value) {
    $teachers[ $value["id"] ] = $value;
  }

?>
<!DOCTYPE html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel='shortcut icon' type='image/x-icon' href='./favicon.ico' />
  <title>Cytaty nauczycieli &alpha;</title>
  <link rel="stylesheet" href="../css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
  <link rel="stylesheet" href="../css/style.min.css">
</head>
<body class="admin">
  <nav class="navbar navbar-default navbar-fixed-top">
    <div class="container">
      <div class="navbar-header">
        <button class="navbar-toggle collapsed" type="button" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false"><span class="sr-only">Toggle navigation</span><span class="icon-bar"></span><span class="icon-bar"></span></button>
      </div>
      <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
        <ul class="nav navbar-nav">
          <li><a href="http://cytaty.github.io">Pokaż wszystkie cytaty</a></li>
          <li><a href="http://cytaty.github.io/add_cite.html">Dodaj cytat</a></li>
          <li><a href="http://cytaty.github.io/add_teacher.html">Dodaj nauczyciela</a></li>
        </ul>

        <?php if(isset($_SESSION["auth"]) && $_SESSION["auth"] === true) { ?>
        <ul class="nav navbar-nav navbar-right">
          <li><a href="?logout">Wyloguj się</a></li>
        </ul>
        <?php } ?>
      </div>
    </div>
  </nav>
  <main class="container">
    <?php if(isset($_SESSION["auth"]) && $_SESSION["auth"] === true) { ?>

    <h2>Nowe cytaty
      <button class="pull-right btn btn-sm btn-danger"><span class="hidden-xs">Odrzuć wszystkie</span><span class="glyphicon glyphicon-remove visible-xs-inline-block" aria-hidden="true"></span></button>
      <button class="pull-right btn btn-sm btn-success"><span class="hidden-xs">Przyjmij wszystkie</span><span class="glyphicon glyphicon-ok visible-xs-inline-block" aria-hidden="true"></span></button>
    </h2>
    <div class="new-quotes">
      <?php
      foreach ($quotes as $key => $value) {
        $id = $value["id"];
        $text = $value["text"];
        $teacher_id = $value["teacher_id"];
        $teacher = $teachers[$teacher_id]["name"];
        $added = strtotime($value["date_added"]);

        $active = $value["active"];
        $activeClass = ($active) ? "" : ' inactive';

        if( $added >= $lastLoggedIn && !$active ){
          echo '<blockquote class="quote'.$activeClass.'" data-id="'.$id.'">';
          echo '<span contenteditable="true" data-start="'.$text.'">'.$text.'</span>';

          echo '<footer>'.$teacher.'</footer>';

          echo '<div class="controls">';
            echo '<button class="btn btn-xs btn-success"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></button>';
            echo '<button class="btn btn-xs btn-danger"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>';
          echo '</div>';

          echo '</blockquote>';
        }
      }
      ?>

    </div>
    <h2>Nowi nauczyciele</h2>
    <div class="new-teachers">
      <?php
      foreach ($teachers as $key => $value) {
        $name = $value["name"];
        $id = $value["id"];
        $added = strtotime($value["date_added"]);

        if( $added >= $lastLoggedIn ){
          echo '<blockquote>';
          echo '<span contenteditable="true" data-start="'.$name.'">'.$name.'</span> ['.$id.']';

          echo '<div class="controls">';
            echo '<button class="btn btn-xs btn-success"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></button>';
            echo '<button class="btn btn-xs btn-danger"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>';
          echo '</div>';

          echo '</blockquote>';
        }
      }
      ?>

    <br>
    <h2>Wszystkie rekordy</h2>
    <div class="all">
      <ul class="nav nav-pills" role="tablist">
        <li class="active" role="presentation"><a href="#quotes" aria-controls="quotes" role="tab" data-toggle="tab">Cytaty</a></li>
        <li role="presentation"><a href="#teachers" aria-controls="teachers" role="tab" data-toggle="tab">Nauczyciele</a></li>
      </ul>
      <div class="tab-content">
        <div class="tab-pane active" id="quotes" role="tabpanel">
          <?php

          foreach ($quotes as $key => $value) {
            $id = $value["id"];
            $text = $value["text"];
            $teacher_id = $value["teacher_id"];
            $teacher = $teachers[$teacher_id]["name"];
            $added = strtotime($value["date_added"]);

            $active = $value["active"];
            $activeClass = ($active) ? "" : ' inactive';
            echo '<blockquote class="quote'.$activeClass.'" data-id="'.$id.'">';
            echo '<span contenteditable="true" data-start="'.$text.'">'.$text.'</span>';

            echo '<footer>'.$teacher.'</footer>';

            echo '<div class="controls">';
              echo '<button class="btn btn-xs btn-success"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></button>';
              echo '<button class="btn btn-xs btn-warning"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></button>';
              echo '<button class="btn btn-xs btn-danger"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>';
            echo '</div>';

            echo '</blockquote>';
          }


          ?>
        </div>
        <div class="tab-pane" id="teachers" role="tabpanel">
          <?php
          foreach ($teachers as $key => $value) {
            $name = $value["name"];
            $id = $value["id"];

            echo '<blockquote>';
            echo '<span contenteditable="true" data-start="'.$name.'">'.$name.'</span> ['.$id.']';

            echo '<div class="controls">';
              echo '<button class="btn btn-xs btn-success"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></button>';
              echo '<button class="btn btn-xs btn-danger"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>';
            echo '</div>';

            echo '</blockquote>';
          }
          ?>
        </div>
      </div>
    </div>
    <?php } else { ?>
      <form class="form-signin" action="admin.php" method="post">
        <input type="text" id="login" name="login" class="form-control" placeholder="Login" required="" autofocus="">
        <input type="password" id="password" name="password" class="form-control" placeholder="Hasło" required="">
        <!-- <div class="checkbox">
          <label>
            <input type="checkbox" value="remember-me"> Zapamiętaj mnie
          </label>
        </div> -->
        <br>
        <button class="btn btn-primary btn-block" type="submit">Zaloguj się</button>
        <?php if( isset($_SESSION["error"]) && $_SESSION["error"] == true ) { ?>
          <br>
          <div class="alert alert-danger" role="alert">
            <p>Błędny login lub hasło.</p>
          </div>
        <?php } ?>
      </form>
    <?php } ?>
  </main>
  <script type="text/javascript" src="https://code.jquery.com/jquery-3.1.1.min.js"></script>
  <script src="../js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
  <script src="../dist/js/admin.min.js" charset="utf-8"></script>
</body>
