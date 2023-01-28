export class BaseResponse {
  public message: string = "Success";
  public data;
  public statusCode = 200;
  public code = 0;
  constructor(data) {
    this.data = data;
  }
  public forError = (message: string = "Error") => {
    this.statusCode = 500;
    this.message = message;
    return this;
  };
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
        "Access-Control-Allow-Credentials": true,
        "Content-Type": "application/json",
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
    body: JSON.stringify(new BaseResponse(data)),
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
    body: JSON.stringify(new BaseResponse(null).forError(data)),
  };
};
