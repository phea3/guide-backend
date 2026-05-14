CREATE TABLE `guide` (
	`id` varchar(256) NOT NULL,
	`guide_name` varchar(256),
	`date_of_birth` datetime,
	`nationality` varchar(256),
	`email` varchar(256),
	`phone_number` varchar(256),
	`address` text,
	`profile_image` varchar(256),
	`status` enum('ACTIVE','INACTIVE'),
	`created_at` datetime DEFAULT (utc_timestamp()),
	`timestamp` int NOT NULL DEFAULT (unix_timestamp()),
	CONSTRAINT `guide_id` PRIMARY KEY(`id`)
);
