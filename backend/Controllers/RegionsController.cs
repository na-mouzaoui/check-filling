using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CheckFillingAPI.Data;
using CheckFillingAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace CheckFillingAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RegionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public RegionsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/regions
    [HttpGet]
    public async Task<IActionResult> GetAllRegions()
    {
        var regions = await _context.Regions.ToListAsync();

        return Ok(regions.Select(r => new
        {
            r.Id,
            r.Name,
            Wilayas = JsonSerializer.Deserialize<List<string>>(r.WilayasJson),
            r.CreatedAt
        }));
    }

    // GET: api/regions/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetRegion(int id)
    {
        var region = await _context.Regions.FindAsync(id);
        if (region == null)
            return NotFound();

        return Ok(new
        {
            region.Id,
            region.Name,
            Wilayas = JsonSerializer.Deserialize<List<string>>(region.WilayasJson),
            region.CreatedAt
        });
    }

    // GET: api/regions/by-name/{name}
    [HttpGet("by-name/{name}")]
    public async Task<IActionResult> GetRegionByName(string name)
    {
        var region = await _context.Regions.FirstOrDefaultAsync(r => r.Name == name);
        if (region == null)
            return NotFound();

        return Ok(new
        {
            region.Id,
            region.Name,
            Wilayas = JsonSerializer.Deserialize<List<string>>(region.WilayasJson),
            region.CreatedAt
        });
    }

    // PUT: api/regions/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRegion(int id, [FromBody] UpdateRegionRequest request)
    {
        var region = await _context.Regions.FindAsync(id);
        if (region == null)
            return NotFound();

        if (request.Wilayas != null && request.Wilayas.Count > 0)
        {
            region.WilayasJson = JsonSerializer.Serialize(request.Wilayas);
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            region.Id,
            region.Name,
            Wilayas = JsonSerializer.Deserialize<List<string>>(region.WilayasJson),
            region.CreatedAt
        });
    }
}

public class UpdateRegionRequest
{
    public List<string>? Wilayas { get; set; }
}
