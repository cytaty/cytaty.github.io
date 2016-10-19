<?php
  header("access-control-allow-origin: *");
  require_once 'passwords.php';

  try {
    $db = new PDO('mysql:host='.HOST.';dbname='.DATABASE.';charset=utf8mb4', LOGIN, PASSWORD);
  } catch (PDOException $e) {
    $error = array();
    $error["error"] = utf8_encode($e->getMessage());
    $error["error_code"] = "0";
    echo json_encode($error);
    die();
  }

  if( isset($_GET["name"]) ){
    $name = $_GET["name"];
    $name = htmlentities( strip_tags($name) );

    $rowsQuery = $db->prepare("INSERT INTO `teachers`(`name`) VALUES (:name)");
    $rowsQuery->execute(array(':name' => $name));

    echo json_encode(array());
  } else {
    $error = array();

    $error["error"] = "Wypełnij wszystkie wymagane pola!";
    $error["error_code"] = "1";

    echo json_encode($error);
  }
?>
