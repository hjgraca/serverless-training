using System;

public static void Run(string myQueueItem, ICollector<string> outputQueueItem, TraceWriter log)
{
    log.Info($"C# Queue trigger function processed: {myQueueItem}");
    outputQueueItem.Add(myQueueItem);
}
