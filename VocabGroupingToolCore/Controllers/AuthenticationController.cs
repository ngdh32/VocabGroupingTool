using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using VocabGroupingToolCore.Models.AuthenModal;
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

        private UserManager<ApplicationUser> userManager { get; set; }

        public AuthenticationController(ApplicationDbContext _dbContext, IConfiguration _configuration, UserManager<ApplicationUser> _userManager)
        {
            dbContext = _dbContext;
            configuration = _configuration;
            userManager = _userManager;
        }

        [HttpPost("[action]")]
        public ActionResult<ResultModel> Login([FromBody] LoginView loginView)
        {
            try
            {
                // discover endpoints from metadata
                var client = new HttpClient();

                var disco = client.GetDiscoveryDocumentAsync(configuration["vgt_auth_url"]).Result;
                if (disco.IsError)
                {
                    return new ResultModel()
                    {
                        Code = 1999,
                        Message = "Cannot discover endpoint"
                    };
                }

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
                    return new ResultModel()
                    {
                        Code = 1999,
                        Message = "Error occurs when requesting access token"
                    };
                }
                else
                {
                    return new ResultModel()
                    {
                        Code = 200,
                        Message = "",
                        Data = tokenResponse.AccessToken

                    };
                }
            }
            catch (Exception ex)
            {
                return new ResultModel()
                {
                    Code = 1999,
                    Message = "Error occurs when requesting access token"
                };
            }

        }

        [HttpPost("[action]")]
        public ActionResult<ResultModel> Register([FromBody] LoginView loginView)
        {
            try
            {
                var user = userManager.FindByNameAsync(loginView.name).Result;

                if (user != null)
                {
                    return new ResultModel()
                    {
                        Code = 1999,
                        Message = "User has been Created",
                        Data = null
                    };
                }


                user = new ApplicationUser
                {
                    //Id = Guid.NewGuid().ToString(),
                    UserName = loginView.name,
                    Email = loginView.name,
                    SecurityStamp = Guid.NewGuid().ToString(), // need to add this !!!
                    lastVocabUpdateDate = ""
                };
                var result = userManager.CreateAsync(user, loginView.password).Result;

                user = userManager.FindByNameAsync(loginView.name).Result;

                result = userManager.AddClaimsAsync(user, new Claim[]{
                                new Claim(JwtClaimTypes.Name, loginView.name ),
                                new Claim(JwtClaimTypes.Email, loginView.name)
                            }).Result;


                var saveChangesResult = dbContext.SaveChanges();
                return new ResultModel()
                {
                    Code = 200,
                    Message = "",
                    Data = null
                };
            }
            catch (Exception ex)
            {
                return new ResultModel()
                {
                    Code = 1999,
                    Message = "Error occurs when requesting access token"
                };
            }
        }



    }

}
