using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CheckFillingAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Banks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PdfUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PositionsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Banks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Checks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AmountInWords = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Payee = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    City = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Date = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Reference = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Bank = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Checks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Checks_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Banks",
                columns: new[] { "Id", "Code", "CreatedAt", "Name", "PdfUrl", "PositionsJson" },
                values: new object[,]
                {
                    { 1, "BNA", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "BNA - Banque Nationale d'Algérie", null, "{\"City\":{\"X\":50,\"Y\":100,\"Width\":150,\"FontSize\":14},\"Date\":{\"X\":400,\"Y\":100,\"Width\":150,\"FontSize\":14},\"Payee\":{\"X\":120,\"Y\":180,\"Width\":400,\"FontSize\":14},\"AmountInWords\":{\"X\":120,\"Y\":240,\"Width\":500,\"FontSize\":12},\"AmountInWordsLine2\":null,\"Amount\":{\"X\":450,\"Y\":300,\"Width\":150,\"FontSize\":18}}" },
                    { 2, "CPA", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "CPA - Crédit Populaire d'Algérie", null, "{\"City\":{\"X\":50,\"Y\":100,\"Width\":150,\"FontSize\":14},\"Date\":{\"X\":400,\"Y\":100,\"Width\":150,\"FontSize\":14},\"Payee\":{\"X\":120,\"Y\":180,\"Width\":400,\"FontSize\":14},\"AmountInWords\":{\"X\":120,\"Y\":240,\"Width\":500,\"FontSize\":12},\"AmountInWordsLine2\":null,\"Amount\":{\"X\":450,\"Y\":300,\"Width\":150,\"FontSize\":18}}" },
                    { 3, "BEA", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "BEA - Banque Extérieure d'Algérie", null, "{\"City\":{\"X\":50,\"Y\":100,\"Width\":150,\"FontSize\":14},\"Date\":{\"X\":400,\"Y\":100,\"Width\":150,\"FontSize\":14},\"Payee\":{\"X\":120,\"Y\":180,\"Width\":400,\"FontSize\":14},\"AmountInWords\":{\"X\":120,\"Y\":240,\"Width\":500,\"FontSize\":12},\"AmountInWordsLine2\":null,\"Amount\":{\"X\":450,\"Y\":300,\"Width\":150,\"FontSize\":18}}" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "PasswordHash" },
                values: new object[] { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "test@gmail.com", "$2a$11$3f1y0aSd2iVFhKoWi60oVuwBiNQb913o5x94e0pYXB9eaqvHXW1By" });

            migrationBuilder.CreateIndex(
                name: "IX_Banks_Code",
                table: "Banks",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Checks_UserId",
                table: "Checks",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Banks");

            migrationBuilder.DropTable(
                name: "Checks");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
