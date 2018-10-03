#r "System.Configuration"
#r "System.Data"

using System.Configuration;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Net;

public static async Task<HttpResponseMessage> Run(HttpRequestMessage req, TraceWriter log)
{
    log.Info("C# HTTP trigger function processed a request.");

    dynamic data = await req.Content.ReadAsAsync<object>();

    var str = ConfigurationManager.ConnectionStrings["sqldb_connection"].ConnectionString;
    int rows = 0;

    using (SqlConnection conn = new SqlConnection(str))
    {
        conn.Open();
        var completed = data.completed == true ? 1 :0;
        string text = "UPDATE Todos " + 
            "SET [Completed] = 1  WHERE title = '" + data.title + "'";
        
        log.Info("Going to update item");
        using (SqlCommand cmd = new SqlCommand(text, conn))
        {
            rows = await cmd.ExecuteNonQueryAsync();
        }
    }

    return rows == 0 ? req.CreateResponse(HttpStatusCode.Conflict) 
    : req.CreateResponse(HttpStatusCode.Created);
}
