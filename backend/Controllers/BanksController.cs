using CheckFillingAPI.Models;
using CheckFillingAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace CheckFillingAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BanksController : ControllerBase
{
    private readonly IBankService _bankService;

    public BanksController(IBankService bankService)
    {
        _bankService = bankService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var banks = await _bankService.GetAllBanksAsync();
        return Ok(new { banks });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var bank = await _bankService.GetBankByIdAsync(id);
        if (bank == null)
        {
            return NotFound(new { message = "Banque non trouvée" });
        }
        return Ok(bank);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] BankCreateRequest request)
    {
        var bank = new Bank
        {
            Code = request.Code,
            Name = request.Name,
            PositionsJson = "{}"
        };

        var createdBank = await _bankService.CreateBankAsync(bank, request.Pdf);
        return CreatedAtAction(nameof(GetById), new { id = createdBank.Id }, createdBank);
    }

    [HttpPatch("{id}")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromForm] BankUpdateRequest request)
    {
        var bank = new Bank
        {
            Code = request.Code ?? "",
            Name = request.Name ?? "",
            PositionsJson = request.Positions ?? "{}"
        };

        var updatedBank = await _bankService.UpdateBankAsync(id, bank, request.Pdf);
        if (updatedBank == null)
        {
            return NotFound(new { message = "Banque non trouvée" });
        }

        return Ok(updatedBank);
    }

    [HttpPatch("{id}/positions")]
    public async Task<IActionResult> UpdatePositions(int id, [FromBody] BankPositions positions)
    {
        var bank = await _bankService.UpdateBankPositionsAsync(id, positions);
        if (bank == null)
        {
            return NotFound(new { message = "Banque non trouvée" });
        }

        return Ok(bank);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _bankService.DeleteBankAsync(id);
        if (!success)
        {
            return NotFound(new { message = "Banque non trouvée" });
        }

        return NoContent();
    }
}

public record BankCreateRequest(string Code, string Name, IFormFile? Pdf);
public record BankUpdateRequest(string? Code, string? Name, string? Positions, IFormFile? Pdf);
