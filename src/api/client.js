const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export async function mockRequest(data, { ms = 900 } = {}) {
  await delay(ms);
  return data;
}

export async function mockError(message, { ms = 900 } = {}) {
  await delay(ms);
  throw new Error(message);
}
