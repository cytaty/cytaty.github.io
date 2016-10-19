<?php
  header("access-control-allow-origin: *");
  require_once 'passwords.php';
  $db = new PDO('mysql:host='.HOST.';dbname='.DATABASE.';charset=utf8mb4', LOGIN, PASSWORD);

  $text = $_GET["text"];
  $text = htmlentities( strip_tags($text) );
  $text = str_replace("\n", "<br>", $text);



  $rowsQuery = $db->prepare("INSERT INTO `quotes`(`text`, `date_said`, `teacher_id`) VALUES (:text, :date, :teacher)");
  $rowsQuery->execute(array(':text' => $text, ':date' => $_GET["date"], 'teacher' => $_GET["teacher"]));
  $rows = $rowsQuery->fetchAll(PDO::FETCH_ASSOC);

  $teachersQuery = $db->prepare("SELECT * FROM `teachers`");
  $teachersQuery->execute();
  $teachers = $teachersQuery->fetchAll(PDO::FETCH_ASSOC);
?>
