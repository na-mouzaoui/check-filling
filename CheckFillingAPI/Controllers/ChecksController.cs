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
        return Ok(checks);
    }

    [HttpGet("user")]
    public async Task<IActionResult> GetByUser()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var checks = await _checkService.GetChecksByUserIdAsync(userId);
        return Ok(checks);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var check = await _checkService.GetCheckByIdAsync(id);
        if (check == null)
        {
            return NotFound(new { message = "Chèque non trouvé" });
        }
        return Ok(check);
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
        return CreatedAtAction(nameof(GetById), new { id = createdCheck.Id }, createdCheck);
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
