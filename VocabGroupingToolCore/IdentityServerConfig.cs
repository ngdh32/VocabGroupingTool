using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IdentityServer4.Models;
using IdentityServer4.Test;
using IdentityServer4;
using System.Security.Claims;
using IdentityModel;
using Microsoft.Extensions.Configuration;


namespace VocabGroupingToolCore
{
    public class IdentityServerConfig
    {
        private IConfiguration configuration { get; set; }

        public IdentityServerConfig(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        public IEnumerable<IdentityResource> GetIdentityResources()
        {

            return new IdentityResource[]
            {
                new IdentityResources.OpenId(),
                new IdentityResources.Profile()
            };
        }

        public IEnumerable<ApiResource> GetApis()
        {
            return new List<ApiResource>
            {
                new ApiResource{
                    Name = "api1",

                    Scopes =
                    {
                        new Scope()
                        {
                            Name = "api1.full_access",
                            DisplayName = "Full access to API 2",
                            UserClaims = {
                                JwtClaimTypes.Name
                               ,JwtClaimTypes.Email
                            }

                        }
                    }
                }
            };
        }

        public IEnumerable<Client> GetClients()
        {
            return new List<Client>
            {
                new Client
                {
                    ClientId = configuration["vgt_client_id"],

                    // no interactive user, use the clientid/secret for authentication
                    AllowedGrantTypes = GrantTypes.ResourceOwnerPassword,

                    // secret for authentication
                    ClientSecrets =
                    {
                        new Secret(configuration["vgt_client_password"].Sha256())
                    },

                    // scopes that client has access to
                    AllowedScopes = {
                        "api1.full_access"
                        ,IdentityServerConstants.StandardScopes.OpenId
                        ,IdentityServerConstants.StandardScopes.Profile
                    }
                }
            };
        }
    }

}
