<?php
	
	// DATABASE Credentials
	define('DB_USER', 'regattenwebsite');
	define('DB_PASS', 'RBpOv4YYtZKWIGcN');
	define('DB_HOST', 'localhost');
	define('DB_DATABASE', 'regattenwebsite');
	
	define('DB_CHANGE_TIME', true);
	define('DB_USE_UTF8', true);  // use utf-8 in DB requests
	
	// DATABASE Table names
	define('DB_TABLE_USERS', 'users');
	define('DB_TABLE_LOGINS', 'logins');
	define('DB_TABLE_KEEPLOGGEDIN', 'keeploggedin');
	define('DB_TABLE_RESET', 'rstpw');
	
	define('DB_TABLE_CLUBS', 'regatta_clubs');
	define('DB_TABLE_SUFFIX_BOATS', '_boats');
	define('DB_TABLE_SUFFIX_SAILORS', '_sailors');
	define('DB_TABLE_SUFFIX_PLANNING', '_planning');
	define('DB_TABLE_SUFFIX_REGATTAS', '_regattas');
	define('DB_TABLE_SUFFIX_RESULTS', '_results');
	define('DB_TABLE_TRIM_BOATS', 'trim_boats');
	define('DB_TABLE_TRIM_USERS', 'trim_users');
	define('DB_TABLE_TRIM_TRIMS', 'trim_trims');
	define('DB_TABLE_NEWS', 'news');
	define('DB_TABLE_UPDATETIMES', '_updatetimes');
	
	// PERMISSIONS
	define('PERM_ALL', 0);
	define('PERM_REGISTERED', 1);
	define('PERM_READ', 2);
	define('PERM_WRITE', 4);
	define('PERM_ADMIN', 8);
	
	// OUTGOING MAILS - Credentials for outgoing mails
	define('MAIL_SMTP_HOST', 'ssl://ostertun.net');               // SMTP Server address
	define('MAIL_SMTP_PORT', 465);                       // port to use
	define('MAIL_FROM_ADDRESS', 'no-reply@regatten.net');  // address to send mails from
	define('MAIL_USERNAME', MAIL_FROM_ADDRESS);             // if true: username
	define('MAIL_PASSWORD', 'pVc05j_3');                    //  & password
	
?>