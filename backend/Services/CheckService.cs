using CheckFillingAPI.Data;
using CheckFillingAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace CheckFillingAPI.Services;

public class CheckService : ICheckService
{
    private readonly AppDbContext _context;

    public CheckService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Check>> GetAllChecksAsync()
    {
        return await _context.Checks
            .Include(c => c.User)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Check>> GetChecksByUserIdAsync(int userId)
    {
        return await _context.Checks
            .Include(c => c.User)
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<Check?> GetCheckByIdAsync(int id)
    {
        return await _context.Checks
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Check> CreateCheckAsync(Check check)
    {
        check.CreatedAt = DateTime.UtcNow;
        _context.Checks.Add(check);
        await _context.SaveChangesAsync();
        return check;
    }

    public async Task<object> GetStatsAsync()
    {
        var checks = await _context.Checks.Include(c => c.User).ToListAsync();
        var users = await _context.Users.ToListAsync();

        var totalAmount = checks.Sum(c => c.Amount);
        var totalChecks = checks.Count;

        var checksByBank = checks
            .GroupBy(c => c.Bank)
            .ToDictionary(g => g.Key, g => g.Count());

        var amountByUser = checks
            .GroupBy(c => c.UserId)
            .ToDictionary(g => g.Key, g => g.Sum(c => c.Amount));

        return new
        {
            totalAmount,
            totalChecks,
            checksByBank,
            amountByUser
        };
    }
}
