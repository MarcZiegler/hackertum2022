-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `isRealUser` BOOLEAN NOT NULL DEFAULT true,
    `Money` DOUBLE NOT NULL DEFAULT 10000,
    `token` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Follows` (
    `followsId` INTEGER NOT NULL,
    `followedByID` INTEGER NOT NULL,

    UNIQUE INDEX `Follows_followsId_followedByID_key`(`followsId`, `followedByID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ticker` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticker` VARCHAR(10) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Ticker_ticker_key`(`ticker`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MarketActionHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `typeOfMarketAction` ENUM('BUY', 'SELL') NOT NULL,
    `typeOfChange` ENUM('Add', 'Delete') NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tickerId` INTEGER NOT NULL,
    `marketActionId` INTEGER NULL,
    `price` DOUBLE NOT NULL,
    `shares` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MarketAction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `typeOfMarketAction` ENUM('BUY', 'SELL') NOT NULL,
    `userId` INTEGER NOT NULL,
    `tickerId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `price` DOUBLE NOT NULL,
    `shares` INTEGER NOT NULL,

    UNIQUE INDEX `MarketAction_userId_tickerId_typeOfMarketAction_price_key`(`userId`, `tickerId`, `typeOfMarketAction`, `price`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TickerHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tickerId` INTEGER NOT NULL,
    `executed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `amount` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_MarketActionHistoryToTickerHistory` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_MarketActionHistoryToTickerHistory_AB_unique`(`A`, `B`),
    INDEX `_MarketActionHistoryToTickerHistory_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
