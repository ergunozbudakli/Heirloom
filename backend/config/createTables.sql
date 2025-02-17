IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[Users](
    [UserID] [int] IDENTITY(1,1) NOT NULL,
    [FirstName] [nvarchar](50) NOT NULL,
    [LastName] [nvarchar](50) NOT NULL,
    [Email] [nvarchar](100) NOT NULL,
    [PasswordHash] [nvarchar](255) NOT NULL,
    [Phone] [nvarchar](20) NULL,
    [BirthDate] [date] NULL,
    [Gender] [nvarchar](10) NULL,
    [CreatedAt] [datetime] NOT NULL,
    [UpdatedAt] [datetime] NOT NULL,
    [LastLoginAt] [datetime] NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([UserID] ASC),
    CONSTRAINT [UQ_Users_Email] UNIQUE NONCLUSTERED ([Email] ASC)
)
END

-- Adresler tablosu
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Addresses]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[Addresses](
    [AddressID] [int] IDENTITY(1,1) NOT NULL,
    [UserID] [int] NOT NULL,
    [AddressTitle] [nvarchar](50) NOT NULL,
    [FirstName] [nvarchar](50) NOT NULL,
    [LastName] [nvarchar](50) NOT NULL,
    [Phone] [nvarchar](20) NULL,
    [City] [nvarchar](50) NOT NULL,
    [District] [nvarchar](50) NOT NULL,
    [Neighborhood] [nvarchar](100) NOT NULL,
    [PostalCode] [nvarchar](5) NOT NULL,
    [AddressText] [nvarchar](500) NOT NULL,
    [IsDefault] [bit] NOT NULL DEFAULT(0),
    [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE(),
    [UpdatedAt] [datetime] NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_Addresses] PRIMARY KEY CLUSTERED ([AddressID] ASC),
    CONSTRAINT [FK_Addresses_Users] FOREIGN KEY ([UserID]) REFERENCES [dbo].[Users] ([UserID])
)
END

-- Adres tablosu için indeksler
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Addresses_UserID' AND object_id = OBJECT_ID('Addresses'))
BEGIN
    CREATE INDEX [IX_Addresses_UserID] ON [dbo].[Addresses] ([UserID])
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Addresses_City_District' AND object_id = OBJECT_ID('Addresses'))
BEGIN
    CREATE INDEX [IX_Addresses_City_District] ON [dbo].[Addresses] ([City], [District])
END

-- Eski adres kolonlarını Users tablosundan kaldır
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'City')
BEGIN
    ALTER TABLE [dbo].[Users] DROP COLUMN [City]
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'District')
BEGIN
    ALTER TABLE [dbo].[Users] DROP COLUMN [District]
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'Neighborhood')
BEGIN
    ALTER TABLE [dbo].[Users] DROP COLUMN [Neighborhood]
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'PostalCode')
BEGIN
    ALTER TABLE [dbo].[Users] DROP COLUMN [PostalCode]
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'Address')
BEGIN
    ALTER TABLE [dbo].[Users] DROP COLUMN [Address]
END

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Carts]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[Carts](
    [CartID] [int] IDENTITY(1,1) NOT NULL,
    [UserID] [int] NOT NULL,
    [CartData] [nvarchar](MAX) NOT NULL,
    [CreatedAt] [datetime] NOT NULL,
    [UpdatedAt] [datetime] NOT NULL,
    CONSTRAINT [PK_Carts] PRIMARY KEY CLUSTERED ([CartID] ASC),
    CONSTRAINT [FK_Carts_Users] FOREIGN KEY ([UserID]) REFERENCES [dbo].[Users] ([UserID])
)
END 