#r "System.Configuration"
#r "System.Data"

using System.Configuration;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Net;

public static async Task<HttpResponseMessage> Run(HttpRequestMessage req, TraceWriter log)
{
    log.Info("C# HTTP trigger function processed a request.");

    string action = req.GetQueryNameValuePairs()
    .FirstOrDefault(q => string.Compare(q.Key, "action", true) == 0)
    .Value;

    dynamic data = await req.Content.ReadAsAsync<object>();

    var str = ConfigurationManager.ConnectionStrings["sqldb_connection"].ConnectionString;
    int rows = 0;

    using (SqlConnection conn = new SqlConnection(str))
    {
        conn.Open();
        string text = "";
        if(action == "deleteall"){
            text = "Delete from Todos";
        }else{
            text = "Delete from Todos " + 
                " WHERE Id = " + data.id;
        }
        
        log.Info("Going to delete item");
        
        using (SqlCommand cmd = new SqlCommand(text, conn))
        {
            rows = await cmd.ExecuteNonQueryAsync();
        }
    }

    return rows == 0 ? req.CreateResponse(HttpStatusCode.Conflict) 
    : req.CreateResponse(HttpStatusCode.Created);
}
