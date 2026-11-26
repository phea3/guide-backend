CREATE TABLE `user_friend` (
	`id` varchar(256) NOT NULL,
	`user_id` varchar(256),
	`friend_id` varchar(256),
	`status` enum('request','accepted','rejected','blocked') DEFAULT 'request',
	`is_viewed_request` boolean DEFAULT false,
	`description` text,
	`is_archived` boolean DEFAULT false,
	`created_at` datetime DEFAULT (utc_timestamp()),
	`updated_at` datetime DEFAULT (utc_timestamp()),
	`timestamp` int NOT NULL DEFAULT (unix_timestamp()),
	CONSTRAINT `user_friend_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user_friend` ADD CONSTRAINT `user_friend_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_friend` ADD CONSTRAINT `user_friend_friend_id_user_id_fk` FOREIGN KEY (`friend_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;