using CheckFillingAPI.Models;
using CheckFillingAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CheckFillingAPI.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace CheckFillingAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ChecksController : ControllerBase
{
    private readonly ICheckService _checkService;
    private readonly IAuditService _auditService;
    private readonly AppDbContext _context;

    public ChecksController(ICheckService checkService, IAuditService auditService, AppDbContext context)
    {
        _checkService = checkService;
        _auditService = auditService;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _context.Users.FindAsync(userId);
        
        if (user == null)
            return Unauthorized();

        var checks = await _checkService.GetAllChecksAsync();
        
        // Filter by region if user is regionale
        if (user.Role == "regionale" && !string.IsNullOrEmpty(user.Region))
        {
            var region = await _context.Regions.FirstOrDefaultAsync(r => r.Name == user.Region);
            if (region != null)
            {
                var wilayas = JsonSerializer.Deserialize<List<string>>(region.WilayasJson) ?? new List<string>();
                checks = checks.Where(c => !string.IsNullOrEmpty(c.Wilaya) && wilayas.Contains(c.Wilaya)).ToList();
            }
        }

        var result = checks.Select(c => new
        {
            id = c.Id,
            userId = c.UserId,
            amount = c.Amount,
            amountInWords = c.AmountInWords,
            payee = c.Payee,
            city = c.City,
            date = c.Date,
            reference = c.Reference,
            bank = c.Bank,
            wilaya = c.Wilaya,
            createdAt = c.CreatedAt
        });
        return Ok(result);
    }

    [HttpGet("user")]
    public async Task<IActionResult> GetByUser()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _context.Users.FindAsync(userId);
        
        if (user == null)
            return Unauthorized();

        var checks = await _checkService.GetChecksByUserIdAsync(userId);

        // Filter by region if user is regionale
        if (user.Role == "regionale" && !string.IsNullOrEmpty(user.Region))
        {
            var region = await _context.Regions.FirstOrDefaultAsync(r => r.Name == user.Region);
            if (region != null)
            {
                var wilayas = JsonSerializer.Deserialize<List<string>>(region.WilayasJson) ?? new List<string>();
                checks = checks.Where(c => !string.IsNullOrEmpty(c.Wilaya) && wilayas.Contains(c.Wilaya)).ToList();
            }
        }

        var result = checks.Select(c => new
        {
            id = c.Id,
            userId = c.UserId,
            amount = c.Amount,
            amountInWords = c.AmountInWords,
            payee = c.Payee,
            city = c.City,
            date = c.Date,
            reference = c.Reference,
            bank = c.Bank,
            wilaya = c.Wilaya,
            createdAt = c.CreatedAt
        });
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var check = await _checkService.GetCheckByIdAsync(id);
        if (check == null)
        {
            return NotFound(new { message = "Chèque non trouvé" });
        }
        var result = new
        {
            id = check.Id,
            userId = check.UserId,
            amount = check.Amount,
            amountInWords = check.AmountInWords,
            payee = check.Payee,
            city = check.City,
            date = check.Date,
            reference = check.Reference,
            bank = check.Bank,
            wilaya = check.Wilaya,
            createdAt = check.CreatedAt
        };
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CheckCreateRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var check = new Check
        {
            UserId = userId,
            Amount = request.Amount,
            AmountInWords = request.AmountInWords,
            Payee = request.Payee,
            City = request.City,
            Date = request.Date,
            Reference = request.Reference,
            Bank = request.Bank,
            Wilaya = request.Wilaya
        };

        var createdCheck = await _checkService.CreateCheckAsync(check);

        // Log the action
        await _auditService.LogAction(userId, "PRINT_CHECK", "Check", createdCheck.Id, new
        {
            amount = createdCheck.Amount,
            payee = createdCheck.Payee,
            bank = createdCheck.Bank,
            wilaya = createdCheck.Wilaya,
            reference = createdCheck.Reference
        });

        var result = new
        {
            id = createdCheck.Id,
            userId = createdCheck.UserId,
            amount = createdCheck.Amount,
            amountInWords = createdCheck.AmountInWords,
            payee = createdCheck.Payee,
            city = createdCheck.City,
            date = createdCheck.Date,
            reference = createdCheck.Reference,
            bank = createdCheck.Bank,
            wilaya = createdCheck.Wilaya,
            createdAt = createdCheck.CreatedAt
        };
        return CreatedAtAction(nameof(GetById), new { id = createdCheck.Id }, result);
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _context.Users.FindAsync(userId);
        
        if (user == null)
            return Unauthorized();

        // If regionale, calculate stats only for their region's wilayas
        if (user.Role == "regionale" && !string.IsNullOrEmpty(user.Region))
        {
            var region = await _context.Regions.FirstOrDefaultAsync(r => r.Name == user.Region);
            if (region != null)
            {
                var wilayas = JsonSerializer.Deserialize<List<string>>(region.WilayasJson) ?? new List<string>();
                var filteredChecks = await _context.Checks
                    .Where(c => !string.IsNullOrEmpty(c.Wilaya) && wilayas.Contains(c.Wilaya))
                    .ToListAsync();

                var totalAmount = filteredChecks.Sum(c => c.Amount);
                var totalCount = filteredChecks.Count;
                var currentMonth = DateTime.UtcNow.Month;
                var currentYear = DateTime.UtcNow.Year;
                var monthlyCount = filteredChecks.Count(c => c.CreatedAt.Month == currentMonth && c.CreatedAt.Year == currentYear);

                return Ok(new { totalAmount, totalCount, monthlyCount });
            }
        }

        var stats = await _checkService.GetStatsAsync();
        return Ok(stats);
    }
}

public record CheckCreateRequest(
    decimal Amount,
    string AmountInWords,
    string Payee,
    string City,
    string Date,
    string Reference,
    string Bank,
    string? Wilaya
);
