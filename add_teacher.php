<?php
  header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
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

  if( isset($_POST["name"]) ){
    $name = $_POST["name"];
    $name = htmlentities( strip_tags($name) );

    $rowsQuery = $db->prepare("INSERT INTO `teachers`(`name`) VALUES (:name)");
    $rowsQuery->execute(array(':name' => $name));

    $to      = 'bartosz@legiec.eu';
    $subject = 'Dodano nowego nauczyciela!';
    $message = '<html><head><title>Dodano nowego nauczyciela!</title></head><body>'.$name.'<br><a href="http://b.legiec.eu/cytaty/admin.php">Przejdź do panelu administracyjnego.</a></body></html>';
    $headers  = 'MIME-Version: 1.0' . "\r\n" .
    'Content-type: text/html; charset=UTF-8' . "\r\n" .
    'From: notify@cytaty.github.io' . "\r\n" .
    'Reply-To: notify@cytaty.github.io' . "\r\n" .
    'X-Mailer: PHP/' . phpversion();

    echo json_encode(array());
  } else {
    $error = array();

    $error["error"] = "Wypełnij wszystkie wymagane pola!";
    $error["error_code"] = "1";

    echo json_encode($error);
  }
?>
