# My boilerplate

## Description
This repository is a simple template for frontend projects.

## Usage
1: Clone repo
```
$ git clone https://github.com/bibixx/my-boilerplate.git
```
2: Install packages
```
$ npm install
```
3: Start gulp watcher
```
$ gulp
```

### Additional arguments
```
$ gulp --proxy=localhost
```
Specifies path to already existing server. (Defaults to "localhost")
<br>
```
$ gulp --nodes=./node_modules
```
Specifies path to node modules. (Defaults to "localhost/node_modules" if proxy server is defined else defaults to "./node_modules")
