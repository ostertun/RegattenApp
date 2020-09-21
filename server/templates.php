<?php
	
	class Templates {
		
		private $path;
		private $templates;
		
		function __construct($path) {
			if (substr($path, -1) != '/') $path .= '/';
			$this->path = $path;
			$this->templates = [];
		}
		
		function load($name, $params = []) {
			if (!isset($this->templates[$name])) {
				$filename = $this->path . $name . '.html';
				if (file_exists($filename) and is_file($filename)) {
					$this->templates[$name] = file_get_contents($filename);
				} else {
					return "<p>Template '$name' not found!</p>";
				}
			}
			
			$template = $this->templates[$name];
			while (($pos = strpos($template, '$')) !== false) {
				$pos ++;
				$pos2 = strpos($template, ';', $pos);
				if ($pos2 === false) return "<p>Syntax error in template '$name'!</p>";
				$ph = substr($template, $pos, $pos2 - $pos);
				if (!isset($params[$ph])) $params[$ph] = '';
				$template = str_replace('$' . $ph . ';', $params[$ph], $template);
			}
			return $template;
		}
	}
	
?>