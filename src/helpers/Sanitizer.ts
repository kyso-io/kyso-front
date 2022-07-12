export class Sanitizer {
  /**
   * Checks if ${data} is null, and if it is, returns ${defaultValue}. If an exception happens (i.e: because you passed an
   * object and an intermediate property is null like user.team.sluglified_name), then ${defaultValue} is returned as well.
   *
   * @param {*} data The data you want to check that is not null nor undefined
   * @param {*} defaultValue The default value you want to return if ${data} is null or undefined
   * @returns ${data} is is not null nor undefined or ${defaultValue} otherwise
   */
  public static ifNullReturnDefault(data: any, defaultValue: any): any {
    try {
      if (data) {
        return data;
      }
      return defaultValue;
    } catch (ex) {
      return defaultValue;
    }
  }

  /**
   * Transforms first letter of the provided ${text} to uppercase
   *
   * @param text text to transform
   * @returns the text passed as parameter, but with the first character in uppercase
   */
  public static transformToUpperCaseFirstLetter(text: string): string {
    return text && text.length > 0 ? text.charAt(0).toUpperCase() + text.slice(1) : "";
  }
}
