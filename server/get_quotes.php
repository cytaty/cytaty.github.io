<?php
  header('content-type: application/json; charset=utf-8');
  header("access-control-allow-origin: *");
  require_once 'passwords.php';

  try {
    $db = new PDO('mysql:host='.HOST.';dbname='.DATABASE.';charset=utf8mb4', LOGIN, PASSWORD);
    $rowsQuery = $db->prepare("SELECT * FROM `quotes` ORDER BY `quotes`.`id` DESC");
    $rowsQuery->execute();
    $rows = $rowsQuery->fetchAll(PDO::FETCH_ASSOC);
  } catch (PDOException $e) {
    $error = array();
    $error["error"] = utf8_encode($e->getMessage());
    echo json_encode($error);
    die();
  }

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
