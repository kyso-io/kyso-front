export class ToasterMessages {
  public static nonSpecificError(): string {
    return 'We are sorry! Something happened running the operation. Please try again.';
  }

  public static noVerifiedEmailAndNoCaptchaSolvedError(): string {
    return 'Please validate your email and prove that you are not a bot';
  }

  public static noVerifiedEmailError(): string {
    return 'Please validate your email';
  }

  public static noCaptchaSolvedError(): string {
    return 'Please prove that you are not a bot';
  }
}
