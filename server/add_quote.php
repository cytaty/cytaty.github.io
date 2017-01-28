<?php
  header("access-control-allow-origin: *");
  require_once 'passwords.php';

  try {
    $db = new PDO('mysql:host='.HOST.';dbname='.DATABASE.';charset=utf8mb4', LOGIN, PASSWORD);

    $teachersQuery = $db->prepare("SELECT * FROM `teachers`");
    $teachersQuery->execute();
    $teachersOut = $teachersQuery->fetchAll(PDO::FETCH_ASSOC);
    $teachers = array();
  } catch (PDOException $e) {
    $error = array();
    $error["error"] = utf8_encode($e->getMessage());
    $error["error_code"] = "0";
    echo json_encode($error);
    die();
  }

  foreach ($teachersOut as $key => $value) {
    $teachers[ $value["id"] ] = $value;
  }

  if( isset($_POST["text"]) && isset($_POST["date"]) && isset($_POST["teacher"]) && isset( $teachers[ $_POST["teacher"] ] ) ){
    $text = $_POST["text"];
    $text = htmlentities( strip_tags($text) );
    $text = str_replace("\n", "<br>", $text);

    $name = (isset($_POST["name"])) ? $_POST["name"] : "";

    $info = (isset($_POST["info"])) ? $_POST["info"] : $_POST["date"];

    $rowsQuery = $db->prepare("INSERT INTO `quotes`(`text`, `date_said`, `info`, `teacher_id`, `who_added`) VALUES (:text, :date, :info, :teacher, :name)");
    $rowsQuery->execute(array(':text' => $text, ':date' => $info, ':info' => $info, ':teacher' => $_POST["teacher"], ':name' => $name));
    $rows = $rowsQuery->fetchAll(PDO::FETCH_ASSOC);

    $to      = 'bartosz@legiec.eu';
    $subject = 'Dodano nowy cytat!';
    $message  = '<html><head><title>Dodano nowy cytat!</title></head><body>'.$text.'<br>- '.$teachers[ $_POST["teacher"] ]["name"].'<br>';
    if( $name !== "" ){
      $message .= 'Dodano przez: '.$name.'<br>';
    }

    $message .= '<a href="http://b.legiec.eu/cytaty/admin.php">Przejdź do panelu administracyjnego.</a></body></html>';
    $headers  = 'MIME-Version: 1.0' . "\r\n" .
    'Content-type: text/html; charset=UTF-8' . "\r\n" .
    'From: notify@cytaty.github.io' . "\r\n" .
    'Reply-To: notify@cytaty.github.io' . "\r\n" .
    'X-Mailer: PHP/' . phpversion();

    mail($to, $subject, $message, $headers);

    echo json_encode(array());
  } else {
    $error = array();

    if( !isset( $teachers[ $_POST["teacher"] ] ) ){
      $error["error"] = "Taki nauczyciel nie istnieje!";
      $error["error_code"] = "1";
    }

    echo json_encode($error);
  }
?>
