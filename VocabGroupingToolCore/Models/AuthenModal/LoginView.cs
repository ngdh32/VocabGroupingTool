using System;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace VocabGroupingToolCore.Models.AuthenModal
{
    public class LoginView
    {
        public string name { get; set; }
        public string password { get; set; }

    }
}