<?php
  header('content-type: application/json; charset=utf-8');
  header("access-control-allow-origin: *");
  require_once 'passwords.php';

  try {
    $db = new PDO('mysql:host='.HOST.';dbname='.DATABASE.';charset=utf8mb4', LOGIN, PASSWORD);
    $rowsQuery = $db->prepare("SELECT * FROM `quotes` WHERE `active` = 1 ORDER BY `id` DESC");
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

  function getTeacherWithId($id) {
    global $teachers;

    foreach ($teachers as $key => $teacher) {
      if ($teacher["id"] == $id) {
        return $teacher;
      }
    }
    return null;
  }

  foreach ($rows as $row) {
    $data = array(
      "id" => $row["id"],
      "text" => $row["text"],
      "dateAdded" => $row["date_added"],
      "info" => $row["info"],
      "teacher" => getTeacherWithId($row["teacher_id"])["name"],
    );

    array_push($quotes, $data);
  }

  echo json_encode($quotes);
?>
