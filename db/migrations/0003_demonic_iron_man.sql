ALTER TABLE `user` ADD `clerk_user_id` varchar(256);--> statement-breakpoint
ALTER TABLE `user` ADD CONSTRAINT `user_clerk_user_id_unique` UNIQUE(`clerk_user_id`);