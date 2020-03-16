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
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
// using System.Threading;


namespace VocabGroupingToolCore.Controllers
{
    [Route("api/[controller]")]
    [EnableCors("_myAllowSpecificOrigins")]
    [ApiController]
    public class VocabsController : ControllerBase
    {
        private ApplicationDbContext dbContext { get; set; }

        private UserManager<ApplicationUser> userManager { get; set; }

        public VocabsController(ApplicationDbContext _dbContext, UserManager<ApplicationUser> _userManager)
        {
            dbContext = _dbContext;
            userManager = _userManager;
        }

        // GET api/values
        [Authorize]
        [HttpGet]
        public async Task<ActionResult<ResultModel>> Get()
        {
            return await Get(null);
        }

        [Authorize]
        [HttpGet("{lastVocabUpdateDate}")]
        public async Task<ActionResult<ResultModel>> Get(string lastVocabUpdateDate)
        {
            ResultModel result = new ResultModel();

            var nameIdentifier = HttpContext.User.Claims.Where(x => x.Type == ClaimTypes.NameIdentifier).FirstOrDefault();
            if (nameIdentifier != null)
            {
                var user = await userManager.FindByIdAsync(nameIdentifier.Value);
                string userId = nameIdentifier.Value;
                result.Code = 200;
                result.Message = "";
                //result.Data = VocabViewObject.CreateVocabViewObjectList(dbContext.Vocabs.Where(x => x.UserId == userId).ToList(), null);
                if (!string.IsNullOrEmpty(lastVocabUpdateDate))
                {
                    if (lastVocabUpdateDate == user.lastVocabUpdateDate)
                    {
                        result.Data = new VocabViewObjectWithTime()
                        {
                            vocabs = null ,
                            lastVocabUpdateDate = user.lastVocabUpdateDate
                        };
                    }
                    else
                    {
                        result.Data = new VocabViewObjectWithTime()
                        {
                            vocabs = VocabViewObject.CreateVocabViewObjectList(dbContext.Vocabs.Where(x => x.UserId == userId).ToList(), null),
                            lastVocabUpdateDate = user.lastVocabUpdateDate
                        };
                    }
                }
                else
                {
                    result.Data = new VocabViewObjectWithTime()
                    {
                        vocabs = VocabViewObject.CreateVocabViewObjectList(dbContext.Vocabs.Where(x => x.UserId == userId).ToList(), null),
                        lastVocabUpdateDate = user.lastVocabUpdateDate
                    };
                }

                return result;

            }
            else
            {
                result.Code = 1999;
                result.Message = "User ID is not in header";
            }

            return result;

        }

        // GET api/values/5
        // [Authorize]
        // [HttpGet("{id}")]
        // public ActionResult<Vocab> Get(string id)
        // {
        //     return dbContext.Vocabs.Where(x => x.Id == id).FirstOrDefault();
        // }

        // POST api/values
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ResultModel>> Post([FromBody] Vocab vocab)
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
                var user = await userManager.FindByIdAsync(nameIdentifier.Value);
                user.lastVocabUpdateDate = ConvertToTimestamp(DateTime.UtcNow);
                await userManager.UpdateAsync(user);

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
        public async Task<ActionResult<ResultModel>> Put([FromBody] Vocab vocab)
        {
            var nameIdentifier = HttpContext.User.Claims.Where(x => x.Type == ClaimTypes.NameIdentifier).FirstOrDefault();
            if (nameIdentifier == null)
            {
                return new ResultModel()
                {
                    Code = 200
                    ,
                    Message = "User ID is not in header"
                };
            };
            var user = await userManager.FindByIdAsync(nameIdentifier.Value);
            user.lastVocabUpdateDate = ConvertToTimestamp(DateTime.UtcNow);
            await userManager.UpdateAsync(user);

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
        public async Task<ActionResult<ResultModel>>Delete(string id)
        {
            var nameIdentifier = HttpContext.User.Claims.Where(x => x.Type == ClaimTypes.NameIdentifier).FirstOrDefault();
            if (nameIdentifier == null)
            {
                return new ResultModel()
                {
                    Code = 200
                    ,
                    Message = "User ID is not in header"
                };
            };
            var user = await userManager.FindByIdAsync(nameIdentifier.Value);
            user.lastVocabUpdateDate = ConvertToTimestamp(DateTime.UtcNow);
            await userManager.UpdateAsync(user);


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

        private string ConvertToTimestamp(DateTime dateTime){
            return ((Int32)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalSeconds).ToString();
        }

    }
}
