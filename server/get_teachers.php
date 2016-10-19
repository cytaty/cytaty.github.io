<?php
  if( count(get_included_files()) == 1 ) {
    define ('TEST_SUITE', __FILE__);
  }

  require_once 'passwords.php';

  try {
    $db = new PDO('mysql:host='.HOST.';dbname='.DATABASE.';charset=utf8mb4', LOGIN, PASSWORD);

    $teachersQuery = $db->prepare("SELECT * FROM `teachers`");
    $teachersQuery->execute();
    $teachers = $teachersQuery->fetchAll(PDO::FETCH_ASSOC);
  } catch (PDOException $e) {
    $error = array();
    $error["error"] = utf8_encode($e->getMessage());
    echo json_encode($error);
    die();
  }

  if( defined('TEST_SUITE') && TEST_SUITE == __FILE__ ){
    $teachersToPrint = array();
    $i = 1;
    foreach ($teachers as $teacher) {
      $teachersToPrint[ $teacher["id"]*1 ] = array(
        "name" => $teacher["name"],
        "img" => $teacher["img"],
        "id" => $teacher["id"]
      );
    }

    header('content-type: application/json; charset=utf-8');
    header("access-control-allow-origin: *");

    echo json_encode($teachersToPrint);
  }
?>
