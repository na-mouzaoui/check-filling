using CheckFillingAPI.Models;
using CheckFillingAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CheckFillingAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ChecksController : ControllerBase
{
    private readonly ICheckService _checkService;

    public ChecksController(ICheckService checkService)
    {
        _checkService = checkService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var checks = await _checkService.GetAllChecksAsync();
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
            createdAt = c.CreatedAt
        });
        return Ok(result);
    }

    [HttpGet("user")]
    public async Task<IActionResult> GetByUser()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var checks = await _checkService.GetChecksByUserIdAsync(userId);
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
            Bank = request.Bank
        };

        var createdCheck = await _checkService.CreateCheckAsync(check);
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
            createdAt = createdCheck.CreatedAt
        };
        return CreatedAtAction(nameof(GetById), new { id = createdCheck.Id }, result);
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
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
    string Bank
);
