using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using VocabGroupingToolCore.Models.AuthenModal;
using VocabGroupingToolCore.Models;
using VocabGroupingToolCore.Models;
using Microsoft.AspNetCore.Authorization;
using System.Net.Http;
using IdentityModel;
using IdentityModel.Client;
using Microsoft.AspNetCore.Cors;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using System.Security.Claims;

namespace VocabGroupingToolCore.Controllers
{
    [Route("api/[controller]")]
    [EnableCors("_myAllowSpecificOrigins")]
    [ApiController]
    public class AuthenticationController : ControllerBase
    {

        private ApplicationDbContext dbContext { get; set; }

        private IConfiguration configuration { get; set; }

        private UserManager<IdentityUser> userManager { get; set; }

        public AuthenticationController(ApplicationDbContext _dbContext, IConfiguration _configuration, UserManager<IdentityUser> _userManager)
        {
            dbContext = _dbContext;
            configuration = _configuration;
            userManager = _userManager;
        }

        [HttpPost("[action]")]
        public ActionResult<Result> Login([FromBody] LoginView loginView)
        {
            try
            {
                // discover endpoints from metadata
                var client = new HttpClient();

                var disco = client.GetDiscoveryDocumentAsync(configuration["vgt_auth_url"]).Result;
                if (disco.IsError)
                {
                    Console.WriteLine(disco.Error);
                    return new Result()
                    {
                        Code = 1999,
                        Message = "Cannot discover endpoint"
                    };
                }
                Console.WriteLine("Endpoint found!");

                // request token
                var tokenResponse = client.RequestPasswordTokenAsync(new PasswordTokenRequest
                {
                    Address = disco.TokenEndpoint,
                    ClientId = configuration["vgt_client_id"],
                    ClientSecret = configuration["vgt_client_password"],

                    UserName = loginView.name,
                    Password = loginView.password,
                    Scope = configuration["vgt_client_scope"]
                }).Result;

                if (tokenResponse.IsError)
                {
                    Console.WriteLine(tokenResponse.Error);
                    return new Result()
                    {
                        Code = 1999,
                        Message = "Error occurs when requesting access token"
                    };
                }
                else
                {
                    return new Result()
                    {
                        Code = 200,
                        Message = "",
                        Data = tokenResponse.AccessToken

                    };
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return new Result()
                {
                    Code = 1999,
                    Message = "Error occurs when requesting access token"
                };
            }

        }

        [HttpPost("[action]")]
        public ActionResult<Result> Register([FromBody] LoginView loginView)
        {
            try
            {
                var alice = userManager.FindByNameAsync(loginView.name).Result;

                if (alice != null)
                {
                    return new Result()
                    {
                        Code = 1999,
                        Message = "User has been Created",
                        Data = null
                    };
                }


                alice = new IdentityUser
                {
                    //Id = Guid.NewGuid().ToString(),
                    UserName = loginView.name,
                    Email = loginView.name,
                    SecurityStamp = Guid.NewGuid().ToString()
                };
                var result = userManager.CreateAsync(alice, loginView.password).Result;

                alice = userManager.FindByNameAsync(loginView.name).Result;

                result = userManager.AddClaimsAsync(alice, new Claim[]{
                                new Claim(JwtClaimTypes.Name, loginView.name ),
                                new Claim(JwtClaimTypes.Email, loginView.name)
                            }).Result;


                var saveChangesResult = dbContext.SaveChanges();
                return new Result()
                {
                    Code = 200,
                    Message = "",
                    Data = null
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return new Result()
                {
                    Code = 1999,
                    Message = "Error occurs when requesting access token"
                };
            }
        }



    }

}
