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

  if( isset($_GET["text"]) && isset($_GET["date"]) && isset($_GET["teacher"]) && isset( $teachers[ $_GET["teacher"] ] ) ){
    $text = $_GET["text"];
    $text = htmlentities( strip_tags($text) );
    $text = str_replace("\n", "<br>", $text);

    $rowsQuery = $db->prepare("INSERT INTO `quotes`(`text`, `date_said`, `teacher_id`) VALUES (:text, :date, :teacher)");
    $rowsQuery->execute(array(':text' => $text, ':date' => $_GET["date"], 'teacher' => $_GET["teacher"]));
    $rows = $rowsQuery->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(array());
  } else {
    $error = array();

    if( !isset( $teachers[ $_GET["teacher"] ] ) ){
      $error["error"] = "Taki nauczyciel nie istnieje!";
      $error["error_code"] = "1";
    }

    echo json_encode($error);
  }
?>
