using Microsoft.EntityFrameworkCore;
using CheckFillingAPI.Models;

namespace CheckFillingAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Check> Checks { get; set; }
    public DbSet<Bank> Banks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).IsRequired();
            entity.Property(e => e.PasswordHash).IsRequired();
        });

        // Check configuration
        modelBuilder.Entity<Check>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.HasOne(e => e.User)
                  .WithMany(u => u.Checks)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Bank configuration
        modelBuilder.Entity<Bank>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Code).IsRequired();
            entity.Property(e => e.Name).IsRequired();
        });

        // Seed data
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Seed default user (password: test1234)
        var seedCreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        const string seedPasswordHash = "$2a$11$3f1y0aSd2iVFhKoWi60oVuwBiNQb913o5x94e0pYXB9eaqvHXW1By";

        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Email = "test@gmail.com",
                PasswordHash = seedPasswordHash,
                CreatedAt = seedCreatedAt
            }
        );

        // Seed default banks
        var defaultPositions = System.Text.Json.JsonSerializer.Serialize(new BankPositions
        {
            City = new FieldPosition { X = 50, Y = 100, Width = 150, FontSize = 14 },
            Date = new FieldPosition { X = 400, Y = 100, Width = 150, FontSize = 14 },
            Payee = new FieldPosition { X = 120, Y = 180, Width = 400, FontSize = 14 },
            AmountInWords = new FieldPosition { X = 120, Y = 240, Width = 500, FontSize = 12 },
            Amount = new FieldPosition { X = 450, Y = 300, Width = 150, FontSize = 18 }
        });

        modelBuilder.Entity<Bank>().HasData(
            new Bank { Id = 1, Code = "BNA", Name = "BNA - Banque Nationale d'Algérie", PositionsJson = defaultPositions, CreatedAt = seedCreatedAt },
            new Bank { Id = 2, Code = "CPA", Name = "CPA - Crédit Populaire d'Algérie", PositionsJson = defaultPositions, CreatedAt = seedCreatedAt },
            new Bank { Id = 3, Code = "BEA", Name = "BEA - Banque Extérieure d'Algérie", PositionsJson = defaultPositions, CreatedAt = seedCreatedAt }
        );
    }
}
