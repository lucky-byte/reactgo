let broker = null;

const open = async (servers, name) => {
  const { connect } = await import('nats.ws');
  broker = await connect({
    servers: servers,
    name: name,
    reconnectTimeWait: 3000,
    debug: process.env.NODE_ENV === 'development',
  });
  return broker;
}

const getBroker = () => {
  return broker;
}

const JSONCodec = async () => {
  const { JSONCodec } = await import('nats.ws');
  return JSONCodec();
}

const exports = {
  JSONCodec, open, getBroker,
}

export default exports;
