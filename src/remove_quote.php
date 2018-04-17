<?php
  require_once 'passwords.php';

  try {
    $db = new PDO('mysql:host='.HOST.';dbname='.DATABASE.';charset=utf8mb4', LOGIN, PASSWORD);

    if( isset($_POST["id"]) ){
      $deleteQuery = $db->prepare("DELETE FROM `".QUOTES_TABLE."` WHERE `id` = :id");
      $deleteQuery->execute(array(':id' => $_POST["id"]));

      echo json_encode(array($id));
    } else {
      $error = array();
      $error["error"] = "Nie podano wszystkich wymaganych atrybutów!";
      $error["error_code"] = "0";
      echo json_encode($error);
    }

  } catch (PDOException $e) {
    $error = array();
    $error["error"] = utf8_encode($e->getMessage());
    $error["error_code"] = "0";
    echo json_encode($error);
    die();
  }
?>
