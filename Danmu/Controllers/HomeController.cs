using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Danmu.Controllers
{
    [Route("[controller]/[action]")]
    public class HomeController : Controller
    {
        [Route("/")]
        public void Index()
        {
            Response.Redirect("dm.html");
        }
        private static readonly IMemoryCache _cache = new MemoryCache(new MemoryCacheOptions());
        private static readonly object _lockObject = new object();
        private static Dictionary<string, string> _staticList;

        public static Dictionary<string,string> FileIdDictionary
        {
            get
            {
                if (_staticList == null)
                {
                    lock (_lockObject)
                    {
                        if (_staticList == null)
                        {
                            _staticList = new Dictionary<string, string>();
                            _cache.Set("FileIdDictionary", _staticList, new MemoryCacheEntryOptions());
                        }
                    }
                }
                return _staticList;
            }
        }
        public string GetCachedDMId(string filename)
        {
            if (FileIdDictionary.ContainsKey(filename))
            {
                return FileIdDictionary[filename];
            }
            else
            {
                return "";
            }
        }
        public bool GetBlobDownload([FromQuery] string id,string filename)
        {
            try
            {
                if( FileIdDictionary.ContainsKey(id) )
                {
                    FileIdDictionary[filename] = id;
                }
                else
                {
                    FileIdDictionary.Add(filename, id);
                }
                var net = new System.Net.WebClient();
                net.DownloadFile("https://www.missevan.com/sound/getdm?soundid=" + id, System.Environment.CurrentDirectory + "\\wwwroot\\files\\" + filename.Substring(0, filename.Length - 3) + "xml");
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
        public JsonResult getFiles()
        {
            return new JsonResult(getallfilesbyfolder(System.Environment.CurrentDirectory + "\\wwwroot\\files", "*", false));
        }
        /// <summary>
        /// 获取指定文件夹下所有的文件名称
        /// </summary>
        /// <param name="foldername">指定文件夹名称,绝对路径</param>
        /// <param name="filefilter">文件类型过滤,根据文件后缀名,如:*,*.txt,*.xls,注意只能出现*和？,其他符号不支持</param>
        /// <param name="iscontainsubfolder">是否包含子文件夹</param>
        /// <returns>arraylist数组,为所有需要的文件路径名称</returns>
        public static ArrayList getallfilesbyfolder(string foldername, string filefilter, bool iscontainsubfolder)
        {
            ArrayList resarray = new ArrayList();

            string[] files = Directory.GetFiles(foldername);
            for (int i = 0; i < files.Length; i++)
            {
                if (files[i].EndsWith("m4a") || files[i].EndsWith("mp3"))
                    resarray.Add(files[i].Substring(foldername.Length+1));
            }
            if (iscontainsubfolder)
            {
                string[] folders = Directory.GetDirectories(foldername);
                for (int j = 0; j < folders.Length; j++)
                {
                    //遍历所有文件夹
                    ArrayList temp = getallfilesbyfolder(folders[j], filefilter, iscontainsubfolder);
                    resarray.AddRange(temp);
                }
            }
            return resarray;
        }
    }
}
