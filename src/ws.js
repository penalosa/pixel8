export default url => {
  var ws = new WebSocket(url);
  var inprogress = {};
  var connect_resolve;
  var rpc_id = 1;
  var proxy = new Proxy(
    {},
    {
      get: function(_, method) {
        if (method == "subscribe") {
          return (subscription, callback) => {
            inprogress[subscription] = callback;
          };
        } else if (method != "then" && method != "catch") {
          return data => {
            return new Promise((resolve, reject) => {
              inprogress[rpc_id] = [resolve, reject];
              console.log("sening");
              ws.send(
                JSON.stringify({
                  method: method,
                  rpc_id: rpc_id,
                  data: data
                })
              );
              rpc_id++;
            });
          };
        }
      }
    }
  );
  ws.onopen = () => {
    return connect_resolve[0](proxy);
  };
  ws.onmessage = data => {
    var data = JSON.parse(data.data);
    console.log(`Message recieved from server:`, data);

    var real_data = data.data;
    var success = data.success;
    if (data.subscription) {
      var handler = inprogress[data.subscription];
      if (handler) {
        return handler(real_data);
      } else {
        return;
      }
    }

    var handler = inprogress[data.rpc_id];

    if (handler) {
      if (success) {
        handler[0](real_data);
      } else {
        handler[1](real_data);
      }

      delete inprogress[data.rpc_id];
    } else {
    }
  };
  return new Promise(
    (resolve, reject) => (connect_resolve = [resolve, reject])
  );
};
