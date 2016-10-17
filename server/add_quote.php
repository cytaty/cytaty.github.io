<?php
  header("access-control-allow-origin: *");
  require_once 'passwords.php';
  $db = new PDO('mysql:host='.HOST.';dbname='.DATABASE.';charset=utf8mb4', LOGIN, PASSWORD);

  $rowsQuery = $db->prepare("SELECT * FROM `quotes`");
  $rowsQuery->execute();
  $rows = $rowsQuery->fetchAll(PDO::FETCH_ASSOC);

  $teachersQuery = $db->prepare("SELECT * FROM `teachers`");
  $teachersQuery->execute();
  $teachers = $teachersQuery->fetchAll(PDO::FETCH_ASSOC);

  $quotes = array();

  foreach ($rows as $row) {
    $data = array(
      "text" => $row["text"],
      "data" => $row["date"],
      "teacher" => $teachers[ $row["teacher_id"]-1 ]["name"]
    );

    array_push($quotes, $data);
  }

  echo $_GET["test"];
?>
