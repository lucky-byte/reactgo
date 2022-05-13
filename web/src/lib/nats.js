const brokers = [];

// 连接 NATs 服务器
const open = async (servers, name) => {
  const { connect } = await import('nats.ws');

  const broker = await connect({
    servers: servers,
    name: name,
    reconnect: true,
    maxReconnectAttempts: -1,
    waitOnFirstConnect: true,
    debug: process.env.NODE_ENV === 'development',
    verbose: process.env.NODE_ENV === 'development',
  });
  brokers.push(broker);

  // 只需要保留最后的连接
  if (brokers.length > 1) {
    const unwanted = brokers.splice(0, brokers.length - 1);
    for (let i = 0; i < unwanted.length; i++) {
      await unwanted[i].close();
    }
  }
}

// 关闭 NATs 服务器
const close = async () => {
  const unwanted = brokers.splice(0, brokers.length);
  for (let i = 0; i < unwanted.length; i++) {
    await unwanted[i].close();
  }
}

// 获取当前的连接
const getBroker = () => {
  if (brokers.length === 0) {
    return null;
  }
  return brokers[brokers.length - 1];
}

const JSONCodec = async () => {
  const { JSONCodec } = await import('nats.ws');
  return JSONCodec();
}

const exports = {
  JSONCodec, open, close, getBroker,
}

export default exports;
