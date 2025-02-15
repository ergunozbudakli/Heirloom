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