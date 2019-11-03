# VocabGroupingTool

Welcome to my little Vocab Grouping Tool(VGT) project. This application is created for non-native english speakers(my wife and I) who want to save the vocabs that they want to review later.   

<p align="middle">
  <img src="https://ngdh32web.files.wordpress.com/2019/11/img_5942.png" width="30%" />
  <img src="https://ngdh32web.files.wordpress.com/2019/11/img_5941.png" width="30%" /> 
  <img src="https://ngdh32web.files.wordpress.com/2019/11/img_5940.png" width="30%" />
</p>

## Prerequisites

The following need to be installed before launching the application:
- net core 2.2
- node v10.15.1
- database(in my case MySQL)

## Installations

Follow the below steps to install the application:
1. Clone this repository
2. Go to VocabGroupingTool/VocabGroupingToolCore/appsettings.json and change the connection string to yours and the value of data_migration property to "Y"
3. Go to VocabGroupingTool/VocabGroupingToolCore/Startup.cs and change the entity framework provider to yours (e.g. Oracle, MSSQL)
4. Go to VocabGroupingTool/VocabGroupingToolCore/ and execute the following commands to create the database schema:
```
dotnet ef migrations add InitialIdentityServerPersistedGrantDbMigration -c PersistedGrantDbContext -o Migrations/IdentityServer/PersistedGrantDb
dotnet ef migrations add InitialIdentityServerConfigurationDbMigration -c ConfigurationDbContext -o Migrations/IdentityServer/ConfigurationDb
dotnet ef migrations add InitialApplicationDbContext -c ApplicationDbContext -o Migrations/Application/ApplicationDb
dotnet ef database update InitialIdentityServerPersistedGrantDbMigration -c  PersistedGrantDbContext
dotnet ef database update InitialIdentityServerConfigurationDbMigration -c ConfigurationDbContext
dotnet ef database update InitialApplicationDbContext -c ApplicationDbContext
```
5. Run the application and initialize the client and its related api and identity scopes by executing
```
dotnet run
```
6. Go to VocabGroupingTool/VocabGroupingToolCore/appsettings.json and change the value of data_migration property to "N" and run the application again
7. Go to VocabGroupingTool/vocab_grouping_tool_web/ and run the application by executing
```
npm start
```
