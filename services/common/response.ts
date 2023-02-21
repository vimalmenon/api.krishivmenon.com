import packageJson from '../../package.json';

export class BaseResponse {
  public message = 'Success';
  public data = null;
  public statusCode = 200;
  public code = 0;
  public version = `v${packageJson.version}`;
  constructor(code = '0') {
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
      version: this.version,
    };
  };
  public response = () => {
    return {
      statusCode: this.statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(this.getBody()),
    };
  };
}
