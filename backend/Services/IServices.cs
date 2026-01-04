using CheckFillingAPI.Models;

namespace CheckFillingAPI.Services;

public interface IAuthService
{
    Task<(bool Success, string? Token, User? User)> LoginAsync(string email, string password);
    Task<(bool Success, User? User)> RegisterAsync(string email, string password);
    string GenerateJwtToken(User user);
    Task<User?> GetUserByIdAsync(int userId);
    Task<bool> ChangePasswordAsync(int userId, string newPassword);
}

public interface IBankService
{
    Task<IEnumerable<Bank>> GetAllBanksAsync();
    Task<Bank?> GetBankByIdAsync(int id);
    Task<Bank> CreateBankAsync(Bank bank, IFormFile? pdfFile);
    Task<Bank?> UpdateBankAsync(int id, Bank bank, IFormFile? pdfFile);
    Task<bool> DeleteBankAsync(int id);
    Task<Bank?> UpdateBankPositionsAsync(int id, BankPositions positions);
}

public interface ICheckService
{
    Task<IEnumerable<Check>> GetAllChecksAsync();
    Task<IEnumerable<Check>> GetChecksByUserIdAsync(int userId);
    Task<Check?> GetCheckByIdAsync(int id);
    Task<Check> CreateCheckAsync(Check check);
    Task<object> GetStatsAsync();
}
