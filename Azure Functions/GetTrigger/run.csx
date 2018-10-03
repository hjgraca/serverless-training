#r "System.Configuration"
#r "System.Data"
#r "Newtonsoft.Json"

using System.Configuration;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Net;
using System.Collections.Generic;
using System.Data;
using Newtonsoft.Json;

public static async Task<HttpResponseMessage> Run(HttpRequestMessage req, TraceWriter log)
{
    log.Info("C# HTTP trigger function processed a request.");

    var todos = new List<Todo>();

    var str = ConfigurationManager.ConnectionStrings["sqldb_connection"].ConnectionString;
    using (SqlConnection conn = new SqlConnection(str))
    {
        conn.Open();
        var text = "Select * from Todos";

        using (SqlCommand cmd = new SqlCommand(text, conn))
        {
            using (var dr = await cmd.ExecuteReaderAsync())
            {
                while(dr.Read())
                {
                    todos.Add(new Todo {
                        Id = dr.GetInt32(0),
                        Title = dr.GetString(1),
                        Completed = dr.GetBoolean(2)
                    });
                }
            }
        }
    }

    return req.CreateResponse(HttpStatusCode.OK, todos, "application/json");
}

public class Todo {
    [JsonProperty(PropertyName = "id" )]
    public int Id {get;set;}
    [JsonProperty(PropertyName = "title" )]
    public string Title {get;set;}
    [JsonProperty(PropertyName = "completed" )]
    public bool Completed {get;set;}
}