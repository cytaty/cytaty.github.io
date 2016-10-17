<?php
  header('content-type: application/json; charset=utf-8');
  header("access-control-allow-origin: *");
  require_once 'passwords.php';
  $db = new PDO('mysql:host='.HOST.';dbname='.DATABASE.';charset=utf8mb4', LOGIN, PASSWORD);

  $rowsQuery = $db->prepare("SELECT * FROM `quotes`");
  $rowsQuery->execute();
  $rows = $rowsQuery->fetchAll(PDO::FETCH_ASSOC);

  include 'get_teachers.php';

  $quotes = array();

  foreach ($rows as $row) {
    $data = array(
      "text" => $row["text"],
      "dateSaid" => $row["date_said"],
      "teacher" => $teachers[ $row["teacher_id"]-1 ]["name"]
    );

    array_push($quotes, $data);
  }

  echo json_encode($quotes);
?>
