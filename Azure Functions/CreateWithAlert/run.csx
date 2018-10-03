#r "System.Configuration"
#r "System.Data"

using System.Configuration;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Net;

public static async Task<HttpResponseMessage> Run(HttpRequestMessage req, ICollector<string> outputQueueItem, TraceWriter log)
{
    log.Info("C# HTTP trigger function processed a request.");

    dynamic data = await req.Content.ReadAsAsync<object>();

    var str = ConfigurationManager.ConnectionStrings["sqldb_connection"].ConnectionString;
    int resp = 0;

    using (SqlConnection conn = new SqlConnection(str))
    {
        conn.Open();
        
        string text = "Insert into Todos ([Title],[Completed]) OUTPUT Inserted.Id" + 
                " VALUES ('" + data.title + "', 0)";
        
        log.Info("Going to create item");
        
        using (SqlCommand cmd = new SqlCommand(text, conn))
        {
            resp = (int) await cmd.ExecuteScalarAsync();
        }
    }

    outputQueueItem.Add(resp.ToString());

    return resp == 0 ? req.CreateResponse(HttpStatusCode.Conflict) 
    : req.CreateResponse(HttpStatusCode.Created, resp);
}
