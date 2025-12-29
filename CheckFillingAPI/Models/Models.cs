namespace CheckFillingAPI.Models;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public ICollection<Check> Checks { get; set; } = new List<Check>();
}

public class Check
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public decimal Amount { get; set; }
    public string AmountInWords { get; set; } = string.Empty;
    public string Payee { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty;
    public string Bank { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public User User { get; set; } = null!;
}

public class Bank
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? PdfUrl { get; set; }
    public string PositionsJson { get; set; } = "{}";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class BankPositions
{
    public FieldPosition City { get; set; } = new();
    public FieldPosition Date { get; set; } = new();
    public FieldPosition Payee { get; set; } = new();
    public FieldPosition AmountInWords { get; set; } = new();
    public FieldPosition? AmountInWordsLine2 { get; set; }
    public FieldPosition Amount { get; set; } = new();
}

public class FieldPosition
{
    public int X { get; set; }
    public int Y { get; set; }
    public int Width { get; set; }
    public int FontSize { get; set; }
}
