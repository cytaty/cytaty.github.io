<?php
  // include '../../passwords.php';

  define("HOST", getenv("DB_HOST"));
  define("LOGIN", getenv("DB_LOGIN"));
  define("PASSWORD", getenv("DB_PASSWORD"));
  define("DATABASE", getenv("DB_DATABASE"));
  define("QUOTES_TABLE", getenv("DB_QUOTES_TABLE"));
?>
