using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using VocabGroupingToolCore.Models.VocabModel;
using VocabGroupingToolCore.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Cors;
// using System.Threading;


namespace VocabGroupingToolCore.Controllers
{
    [Route("api/[controller]")]
    [EnableCors("_myAllowSpecificOrigins")]
    [ApiController]
    public class VocabsController : ControllerBase
    {
        private ApplicationDbContext dbContext;

        public VocabsController(ApplicationDbContext _dbContext)
        {
            dbContext = _dbContext;
        }

        // GET api/values
        [Authorize]
        [HttpGet]
        public ActionResult<ResultModel> Get()
        {
            ResultModel result = new ResultModel();

            var nameIdentifier = HttpContext.User.Claims.Where(x => x.Type == ClaimTypes.NameIdentifier).FirstOrDefault();
            if (nameIdentifier != null)
            {
                string userId = nameIdentifier.Value;
                result.Code = 200;
                result.Message = "";
                result.Data = VocabViewObject.CreateVocabViewObjectList(dbContext.Vocabs.Where(x => x.UserId == userId).ToList(), null);

            }
            else
            {
                result.Code = 1999;
                result.Message = "User ID is not in header";
            }

            return result;

        }

        // GET api/values/5
        [Authorize]
        [HttpGet("{id}")]
        public ActionResult<Vocab> Get(int id)
        {
            return dbContext.Vocabs.Where(x => x.Id == id).FirstOrDefault();
        }

        // POST api/values
        [HttpPost]
        [Authorize]
        public ActionResult<ResultModel> Post([FromBody] Vocab vocab)
        {
            // Thread.Sleep(2000);
            var nameIdentifier = HttpContext.User.Claims.Where(x => x.Type == ClaimTypes.NameIdentifier).FirstOrDefault();
            if (nameIdentifier == null)
            {
                return new ResultModel()
                {
                    Code = 200
                    ,
                    Message = "User ID is not in header"
                };
            }
            vocab.UserId = nameIdentifier.Value;
            dbContext.Vocabs.Add(vocab);
            int result = dbContext.SaveChanges();
            if (result == 1)
            {
                return new ResultModel()
                {
                    Code = 200
                    ,
                    Message = ""
                };
            }
            else
            {
                return new ResultModel()
                {
                    Code = 1999
                    ,
                    Message = "Update failed."
                };
            }

        }

        // PUT api/values/5
        [HttpPost("{id}")]
        [Authorize]
        public ActionResult<ResultModel> Put([FromBody] Vocab vocab)
        {

            Vocab foundVocab = dbContext.Vocabs.Where(x => x.Id == vocab.Id).FirstOrDefault();
            if (foundVocab == null)
            {
                return new ResultModel()
                {
                    Code = 1999
                        ,
                    Message = "Vocab doesn't exist."
                };
            }
            else
            {
                foundVocab.Word = vocab.Word;
                foundVocab.Meaning = vocab.Meaning;
                foundVocab.Example = vocab.Example;
                dbContext.Vocabs.Update(foundVocab);
                int result = dbContext.SaveChanges();
                if (result == 1)
                {
                    return new ResultModel()
                    {
                        Code = 200
                        ,
                        Message = ""
                    };
                }
                else
                {
                    return new ResultModel()
                    {
                        Code = 1999
                        ,
                        Message = "Update failed."
                    };
                }
            }
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        [Authorize]
        public ActionResult<ResultModel> Delete(int id)
        {
            Vocab foundVocab = dbContext.Vocabs.Where(x => x.Id == id).FirstOrDefault();
            if (foundVocab == null)
            {
                return new ResultModel()
                {
                    Code = 1999
                        ,
                    Message = "Vocab doesn't exist."
                };
            }
            else
            {
                dbContext.Vocabs.Remove(foundVocab);
                int result = dbContext.SaveChanges();
                if (result == 1)
                {
                    return new ResultModel()
                    {
                        Code = 200
                        ,
                        Message = ""
                    };
                }
                else
                {
                    return new ResultModel()
                    {
                        Code = 1999
                        ,
                        Message = "Update failed."
                    };
                }
            }
        }
    }
}
