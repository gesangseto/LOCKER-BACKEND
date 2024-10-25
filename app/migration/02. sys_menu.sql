REPLACE INTO sys_menu (menu_module_id,id,parent_id,name,url,icon,`order`,can_create,can_read,can_update,can_delete,can_print,can_workflow,status) VALUES
	 (1,101,NULL,'Administrator',NULL,'pi pi-fw pi-user',NULL,0,0,0,0,0,0,1),
	 (1,102,101,'Department','/administrator/department',NULL,NULL,1,1,1,1,0,0,1),
	 (1,103,101,'Section','/administrator/section',NULL,NULL,1,1,1,1,0,0,1),
	 (1,104,101,'User','/administrator/user',NULL,NULL,1,1,1,1,0,0,1),
	 (1,201,NULL,'Config',NULL,'pi pi-cog',NULL,0,0,0,0,0,0,1),
	 (1,202,201,'Access Menu','/config/access-menu',NULL,NULL,0,0,1,0,0,0,1),
	 (1,203,201,'Application','/config/application',NULL,NULL,0,0,1,0,0,0,1),
	 (3,301,NULL,'Master',NULL,'pi pi-fw pi-list',NULL,0,0,0,0,0,0,1),
	 (3,302,301,'Customer','/locker/master/customer',NULL,NULL,0,1,0,0,0,0,1),
	 (3,401,NULL,'Transaction',NULL,'pi pi-pw pi-file',NULL,0,0,0,0,0,0,1),
	 (3,402,401,'Message','/locker/transaction/message',NULL,NULL,0,1,0,0,0,0,1),
	 (3,403,401,'Report','/locker/transaction/report',NULL,NULL,0,1,0,0,1,0,1);

