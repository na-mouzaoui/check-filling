using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CheckFillingAPI.Migrations
{
    /// <inheritdoc />
    public partial class FixAdminPasswords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Role",
                value: "admin");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "LastName", "PasswordHash" },
                values: new object[] { "Test", "$2a$11$3f1y0aSd2iVFhKoWi60oVuwBiNQb913o5x94e0pYXB9eaqvHXW1By" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$3f1y0aSd2iVFhKoWi60oVuwBiNQb913o5x94e0pYXB9eaqvHXW1By");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Role",
                value: "comptabilite");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "LastName", "PasswordHash" },
                values: new object[] { "System", "$2a$11$vYZ8QZ5X7FqK9X8yN0YxFO3p7X5Z8qY9Z0x1Y2z3A4b5C6d7E8f9g" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$Q9Qw6Qw6Qw6Qw6Qw6Qw6QeQw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6");
        }
    }
}
