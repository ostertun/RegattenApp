<!-- header and footer bar go here-->
<div class="header header-fixed header-logo-center">
	<a href="<?php echo LINK_PRE; ?>index" class="header-title">Regatten.net <?php echo $_CLASS['name']; ?></a>
	<?php if ($sp['backbutton'] !== false) {
		if ($sp['backbutton'] === true)
			echo '<a href="#" class="back-button header-icon header-icon-1"><i class="fas fa-arrow-left"></i></a>';
		else
			echo '<a href="' . LINK_PRE . $sp['backbutton'] . '" class="header-icon header-icon-1"><i class="fas fa-arrow-left"></i></a>';
	} ?>
	<a href="#" data-menu="menu-developer" class="header-icon header-icon-3"><i class="fas fa-code"></i></a>
	<a href="#" data-menu="menu-settings" class="header-icon header-icon-4"><i class="fas fa-cog"></i></a>
</div>
<div id="footer-bar" class="footer-bar-1">
	<a href="<?php echo LINK_PRE; ?>index"<?php if ($sp['activenav'] == 1) echo ' class="active-nav"'; ?>><i class="fa fa-home"></i><span>Start</span></a>
	<a href="<?php echo LINK_PRE; ?>regattas"<?php if ($sp['activenav'] == 2) echo ' class="active-nav"'; ?>><i class="fa fa-flag-checkered"></i><span>Regatten</span></a>
	<a href="<?php echo LINK_PRE; ?>rank"<?php if ($sp['activenav'] == 3) echo ' class="active-nav"'; ?>><i class="fa fa-trophy"></i><span>Ranglisten</span></a>
	<a href="#" data-menu="menu-lists"<?php if ($sp['activenav'] == 4) echo ' class="active-nav"'; ?>><i class="fa fa-list"></i><span>Listen</span></a>
	<a href="#" data-menu="menu-more"<?php if ($sp['activenav'] == 5) echo ' class="active-nav"'; ?>><i class="fa fa-ellipsis-h"></i><span>Mehr</span><em id="badge-footer-more" class="badge bg-highlight"></em></a>
</div>