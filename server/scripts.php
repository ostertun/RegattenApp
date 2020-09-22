<?php
	
	class Scripts {
		
		private $path;
		private $scripts;
		
		function __construct($path) {
			if (substr($path, -1) != '/') $path .= '/';
			$this->path = $path;
			$this->scripts = [];
		}
		
		function load($name, $params = []) {
			if (!isset($this->scripts[$name])) {
				$filename = $this->path . $name . '.js';
				if (file_exists($filename) and is_file($filename)) {
					$this->scripts[$name] = file_get_contents($filename);
				} else {
					return "<p>Script '$name' not found!</p>";
				}
			}
			
			$script = $this->scripts[$name];
			while (($pos = strpos($script, '$$')) !== false) {
				$pos += 2;
				$pos2 = strpos($script, ';', $pos);
				if ($pos2 === false) return "<p>Syntax error in script '$name'!</p>";
				$ph = substr($script, $pos, $pos2 - $pos);
				if (!isset($params[$ph])) $params[$ph] = '';
				$script = str_replace('$$' . $ph . ';', $params[$ph], $script);
			}
			return '<script>' . $script . '</script>';
		}
	}
	
?>