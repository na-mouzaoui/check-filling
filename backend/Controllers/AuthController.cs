using CheckFillingAPI.Models;
using CheckFillingAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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

        // Déposer le JWT en cookie HttpOnly pour que le front puisse l'envoyer automatiquement
        Response.Cookies.Append("jwt", token!, new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            Secure = false,
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        });

        return Ok(new
        {
            success = true,
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

        Response.Cookies.Append("jwt", token, new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            Secure = false,
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        });

        return Ok(new
        {
            success = true,
            user = new
            {
                id = user!.Id,
                email = user.Email,
                createdAt = user.CreatedAt
            }
        });
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = User.FindFirstValue(ClaimTypes.Email);

        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(email))
        {
            return Unauthorized();
        }

        return Ok(new
        {
            user = new
            {
                id = userId,
                email,
            }
        });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("jwt");
        return Ok(new { success = true });
    }
}

public record LoginRequest(string Email, string Password);
public record RegisterRequest(string Email, string Password);
