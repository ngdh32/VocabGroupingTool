﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using VocabGroupingToolCore.Models;
using Pomelo.EntityFrameworkCore.MySql;
using IdentityServer4.EntityFramework.DbContexts;
using IdentityServer4.EntityFramework.Mappers;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using System.Reflection;
using System.Security.Claims;
using IdentityModel;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Cors.Infrastructure;
using System.Security.Cryptography.X509Certificates;
using System.IO;

namespace VocabGroupingToolCore
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        readonly string MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);

            string connectionString = Configuration.GetConnectionString("Database");
            var migrationsAssembly = typeof(Startup).GetTypeInfo().Assembly.GetName().Name;

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseMySql(connectionString));

            services.AddIdentity<IdentityUser, IdentityRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            // Configure Identity
            services.Configure<IdentityOptions>(options =>
            {
                // Password settings
                options.Password.RequireDigit = false;
                options.Password.RequiredLength = 6;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireLowercase = false;
            });

            services.AddIdentityServer()

            .AddConfigurationStore(options =>
            {
                options.ConfigureDbContext = b =>
                    b.UseMySql(connectionString, sql => sql.MigrationsAssembly(migrationsAssembly));
            })
            .AddOperationalStore(options =>
            {
                options.ConfigureDbContext = b =>
                    b.UseMySql(connectionString, sql => sql.MigrationsAssembly(migrationsAssembly));
                options.EnableTokenCleanup = true;
            })
            .AddAspNetIdentity<IdentityUser>()
            // .AddDeveloperSigningCredential();
            .AddSigningCredential(GetCertificate());

            services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer("Bearer", options =>
            {
                options.Authority = Configuration["vgt_auth_url"];//"https://localhost:5001";
                options.RequireHttpsMetadata = false;
                options.Audience = "api1";
            });

            var corsBuilder = new CorsPolicyBuilder();
            corsBuilder.AllowAnyHeader();
            corsBuilder.AllowAnyMethod();
            corsBuilder.AllowAnyOrigin(); // For anyone access.
            //corsBuilder.WithOrigins("http://localhost:56573"); // for a specific url. Don't add a forward slash on the end!
            corsBuilder.AllowCredentials();


            services.AddCors(options =>
            {
                options.AddPolicy(MyAllowSpecificOrigins, corsBuilder.Build());
            });



        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, UserManager<IdentityUser> userManager)
        {
            // Uncomment when data seeding is needed
            if (Configuration["data_migration"] == "Y")
            {
                InitializeDatabase(app, userManager);
            }


            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            //app.UseAuthentication();

            app.UseIdentityServer();

            app.UseHttpsRedirection();

            app.UseCors(MyAllowSpecificOrigins);
            app.UseMvc();
        }


        private void InitializeDatabase(IApplicationBuilder app, UserManager<IdentityUser> userManager)
        {
            using (var serviceScope = app.ApplicationServices.GetService<IServiceScopeFactory>().CreateScope())
            {
                //serviceScope.ServiceProvider.GetRequiredService<PersistedGrantDbContext>().Database.Migrate();

                var configurationDbContext = serviceScope.ServiceProvider.GetRequiredService<ConfigurationDbContext>();
                //configurationDbContext.Database.Migrate();
                if (!configurationDbContext.Clients.Any())
                {
                    foreach (var client in Config.GetClients())
                    {
                        configurationDbContext.Clients.Add(client.ToEntity());
                    }
                    configurationDbContext.SaveChanges();
                }

                if (!configurationDbContext.IdentityResources.Any())
                {
                    foreach (var resource in Config.GetIdentityResources())
                    {
                        configurationDbContext.IdentityResources.Add(resource.ToEntity());
                    }
                    configurationDbContext.SaveChanges();
                }

                if (!configurationDbContext.ApiResources.Any())
                {
                    foreach (var resource in Config.GetApis())
                    {
                        configurationDbContext.ApiResources.Add(resource.ToEntity());
                    }
                    configurationDbContext.SaveChanges();
                }

                var IdentityDbContext = serviceScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                var alice = new IdentityUser
                {
                    //Id = Guid.NewGuid().ToString(),
                    UserName = "ngdh32@gmail.com",
                    Email = "ngdh32@gmail.com",
                    SecurityStamp = Guid.NewGuid().ToString()
                };
                var result = userManager.CreateAsync(alice, "stm3638863").Result;

                alice = userManager.FindByNameAsync("ngdh32@gmail.com").Result;
                Console.WriteLine(alice == null ? "True" : "False");

                result = userManager.AddClaimsAsync(alice, new Claim[]{
                                new Claim(JwtClaimTypes.Name, "Tim Ng"),
                                new Claim(JwtClaimTypes.Email, "ngdh32@gmail.com")
                            }).Result;


                IdentityDbContext.SaveChanges();

                Console.WriteLine("Done");

            }
        }

        private X509Certificate2 GetCertificate()
        {
            X509Certificate2 cert = null;

            string rootpath = Configuration["vgt_cert_path"];
            if (string.IsNullOrEmpty(rootpath)){
                rootpath = Environment.GetEnvironmentVariable("HOME") + @"\site\wwwroot";
            }
        
            cert = new X509Certificate2(Path.Combine(rootpath, "vgt.pfx"), Configuration["vgt_cert_pw"]);
                

            // Fallback to local file for development
            return cert;
        }
    }
}
