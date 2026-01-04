using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CheckFillingAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddSecondAdminUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Direction", "Email", "FirstName", "LastName", "PasswordHash", "PhoneNumber", "Region", "Role" },
                values: new object[] { 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Administration", "admin@gmail.com", "Admin", "Gmail", "$2a$11$Q9Qw6Qw6Qw6Qw6Qw6Qw6QeQw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6", "0661999998", null, "admin" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3);
        }
    }
}
