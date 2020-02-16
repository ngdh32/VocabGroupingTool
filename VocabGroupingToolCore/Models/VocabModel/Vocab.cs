using System;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace VocabGroupingToolCore.Models.VocabModel
{
    public class Vocab
    {
        public string Id { get; set; }
        public string Word { get; set; }
        public string Meaning { get; set; }
        public string Example { get; set; }
        public string ParentId { get; set; }

        public string UserId { get; set; }

    }
}