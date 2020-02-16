using System;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using VocabGroupingToolCore.Models.VocabModel;
using Microsoft.AspNetCore.Identity;

namespace VocabGroupingToolCore.Models
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Vocab> Vocabs { get; set; }
    }

    public class ApplicationUser : IdentityUser
    {
        public DateTime? lastVocabUpdateDate { get; set; }
    }
}