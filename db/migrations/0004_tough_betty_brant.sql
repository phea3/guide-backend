ALTER TABLE `user` ADD `first_name` varchar(256);--> statement-breakpoint
ALTER TABLE `user` ADD `last_name` varchar(256);--> statement-breakpoint
ALTER TABLE `user` ADD `image_url` varchar(500);--> statement-breakpoint
ALTER TABLE `user` ADD `updated_at` datetime DEFAULT (utc_timestamp());