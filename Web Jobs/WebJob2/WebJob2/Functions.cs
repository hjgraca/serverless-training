using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;

namespace WebJob2
{
    public class Functions
    {
        // This function will get triggered/executed when a new message is written 
        // on an Azure Queue called queue.
        public static void ProcessQueueMessage([QueueTrigger("demo")] string message,
            [Blob("mycontainer/{queueTrigger}", FileAccess.Read)] Stream myBlob,
            [Blob("mycontainer/copy-{queueTrigger}", FileAccess.Write)] Stream outputBlob,
            TextWriter log)
        {
            log.WriteLine($"Blob name:{message} \n Size: {myBlob.Length} bytes");
            myBlob.CopyTo(outputBlob);
        }
    }
}
