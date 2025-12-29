using CheckFillingAPI.Models;
using CheckFillingAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace CheckFillingAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var (success, token, user) = await _authService.LoginAsync(request.Email, request.Password);

        if (!success)
        {
            return Unauthorized(new { message = "Email ou mot de passe incorrect" });
        }

        return Ok(new
        {
            token,
            user = new
            {
                id = user!.Id,
                email = user.Email,
                createdAt = user.CreatedAt
            }
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var (success, user) = await _authService.RegisterAsync(request.Email, request.Password);

        if (!success)
        {
            return BadRequest(new { message = "Cet email est déjà utilisé" });
        }

        var token = _authService.GenerateJwtToken(user!);

        return Ok(new
        {
            token,
            user = new
            {
                id = user!.Id,
                email = user.Email,
                createdAt = user.CreatedAt
            }
        });
    }
}

public record LoginRequest(string Email, string Password);
public record RegisterRequest(string Email, string Password);
