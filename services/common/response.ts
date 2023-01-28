export const respondToSuccess = (data) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(data),
  };
};

export const respondForError = (data) => {
  return {
    statusCode: 500,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: data,
    }),
  };
};
