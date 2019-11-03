using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IdentityServer4.Models;
using IdentityServer4.Test;
using IdentityServer4;
using System.Security.Claims;
using IdentityModel;


namespace VocabGroupingToolCore
{
    public static class IdentityServerConfig
    {
        public static IEnumerable<IdentityResource> GetIdentityResources()
        {

            return new IdentityResource[]
            {
                new IdentityResources.OpenId(),
                new IdentityResources.Profile()
            };
        }

        public static IEnumerable<ApiResource> GetApis()
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

        public static IEnumerable<Client> GetClients()
        {
            return new List<Client>
            {
                new Client
                {
                    ClientId = "VGTClient",

                    // no interactive user, use the clientid/secret for authentication
                    AllowedGrantTypes = GrantTypes.ResourceOwnerPassword,

                    // secret for authentication
                    ClientSecrets =
                    {
                        new Secret("secret".Sha256())
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
