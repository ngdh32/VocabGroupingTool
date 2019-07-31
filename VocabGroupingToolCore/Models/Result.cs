using System;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace VocabGroupingToolCore.Models
{
    public class Result
    {
        public int Code { get; set; }

        public string Message { get; set; }

        public object Data { get; set; }

    }
}