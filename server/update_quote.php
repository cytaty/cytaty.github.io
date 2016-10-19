<?php
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

  if( isset($_GET["id"]) ){
    $id = $_GET["id"];
    $text = "";
    $active = "";

    $data_to_set = "";
    $params = array(':id' => $id);


    if( isset( $_GET["text"] ) ){
      $text = $_GET["text"];
      $text = htmlentities( strip_tags($text) );
      $text = str_replace("\n", "<br>", $text);

      $data_to_set .= ($data_to_set == "") ? "" : ", ";
      $data_to_set .= "`text` = :text";
      $params["text"] = $text;
    }

    if( isset( $_GET["active"] ) ){
      $active = ($_GET["active"] == "true") ? 1 : 0;

      $data_to_set .= ($data_to_set == "") ? "" : ", ";
      $data_to_set .= "`active` = :active";
      $params["active"] = $active;
    }

    if( $data_to_set !== "" ){
      $rowsQuery = $db->prepare("UPDATE `quotes` SET $data_to_set WHERE `id` = :id");
      $rowsQuery->execute($params);
    }

    echo json_encode(array($text, $active, $id));
  } else {
    $error = array();

    $error["error"] = "Nie podano wszystkich wymaganych atrybutów!";
    $error["error_code"] = "0";

    echo json_encode($error);
  }
?>
