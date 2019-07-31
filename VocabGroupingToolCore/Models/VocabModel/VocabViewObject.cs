using System;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;

namespace VocabGroupingToolCore.Models.VocabModel
{
    public class VocabViewObject
    {
        public VocabViewObject()
        {
            SubVocabs = new List<VocabViewObject>();
        }

        public int? Id { get; set; }
        public string Word { get; set; }
        public string Meaning { get; set; }
        public string Example { get; set; }
        public int? ParentId { get; set; }

        public string UserId { get; set; }

        public List<VocabViewObject> SubVocabs { get; set; }

        public static List<VocabViewObject> CreateVocabViewObjectList(List<Vocab> vocabs, int? parentId)
        {
            List<VocabViewObject> result = new List<VocabViewObject>(); 
            var parentVocabs = vocabs.Where(x => x.ParentId == parentId).ToList();
            foreach(var vocab in parentVocabs){
                VocabViewObject vocabViewObject = new VocabViewObject();
                vocabViewObject.Id = vocab.Id;
                vocabViewObject.Word = vocab.Word;
                vocabViewObject.Meaning = vocab.Meaning;
                vocabViewObject.Example = vocab.Example;
                vocabViewObject.ParentId = vocab.ParentId;
                vocabViewObject.UserId = vocab.UserId;

                vocabViewObject.SubVocabs = CreateVocabViewObjectList(vocabs, vocab.Id);
                result.Add(vocabViewObject);
            }
            
            return result;
        }

    }
}