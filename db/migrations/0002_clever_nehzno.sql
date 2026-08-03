CREATE TABLE `available_day` (
	`id` varchar(256) NOT NULL,
	`user_id` varchar(256),
	`start_date` date,
	`end_date` date,
	`remark` text,
	`status` enum('ACTIVE','INACTIVE'),
	`created_at` datetime DEFAULT (utc_timestamp()),
	`timestamp` int NOT NULL DEFAULT (unix_timestamp()),
	CONSTRAINT `available_day_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `available_time` (
	`id` varchar(256) NOT NULL,
	`available_day_id` varchar(256),
	`start_time` datetime,
	`end_time` datetime,
	`remark` text,
	`status` enum('ACTIVE','INACTIVE'),
	`created_at` datetime DEFAULT (utc_timestamp()),
	`timestamp` int NOT NULL DEFAULT (unix_timestamp()),
	CONSTRAINT `available_time_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `available_day` ADD CONSTRAINT `available_day_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `available_time` ADD CONSTRAINT `available_time_available_day_id_available_day_id_fk` FOREIGN KEY (`available_day_id`) REFERENCES `available_day`(`id`) ON DELETE cascade ON UPDATE no action;