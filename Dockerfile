FROM php:7.2.0-apache
RUN docker-php-ext-install pdo_mysql

# COPY config/php.ini /usr/local/etc/php/
COPY src/ /var/www/html/

EXPOSE 80
