-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cin7_id` VARCHAR(64) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `sku` VARCHAR(128) NULL,
    `brand` VARCHAR(128) NULL,
    `price` DECIMAL(12, 2) NULL,
    `last_sync` DATETIME(3) NOT NULL,

    UNIQUE INDEX `products_cin7_id_key`(`cin7_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
