export class BaseResponse {
  public message = "Success";
  public data = null;
  public statusCode = 200;
  public code = 0;
  constructor(code = "0") {
    this.code = parseInt(code);
  }
  public setData = (data) => {
    this.data = data;
    return this;
  };
  public setMessage = (message: string) => {
    this.message = message;
    return this;
  };
  public withError(statusCode = 500) {
    this.statusCode = statusCode;
    return this;
  }
  private getBody = () => {
    return {
      data: this.data,
      code: this.code,
      message: this.message,
    };
  };
  public response = () => {
    return {
      statusCode: this.statusCode,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(this.getBody()),
    };
  };
}

export const respondToSuccess = (data) => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
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
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
};
