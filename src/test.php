<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Page Title</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" type="text/css" media="screen" href="main.css" />
  <script src="main.js"></script>
</head>
<body>
  <h1>TEST</h1>

  <?php
    require_once 'passwords.php';

    $db = new PDO('mysql:host='.HOST.';charset=utf8mb4', LOGIN, PASSWORD);
    $rowsQuery = $db->prepare('SHOW DATABASES');
    $rowsQuery->execute();
    $rows = $rowsQuery->fetchAll(PDO::FETCH_ASSOC);

    echo password_hash('password', PASSWORD_BCRYPT);
    echo "<br>";
    
    foreach ($rows as $row) {
      echo $row["Database"];
      echo "<br>";
    }
    
    echo getenv("MYSQL_ROOT_PASSWORD");
    echo "<br>";
    echo getenv("MYSQL_DATABASE");
  ?>
</body>
</html>
