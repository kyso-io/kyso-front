import type { CommonData } from '@/types/common-data';

export class ToasterMessages {
  public static nonSpecificError(): string {
    return 'We are sorry! Something happened running the operation. Please try again.';
  }

  public static noVerifiedEmailAndNoCaptchaSolvedError(commonData: CommonData): string {
    let htmlButton = '';

    if (commonData && commonData.user && commonData.user.username) {
      htmlButton = `<br/><br/><a target="_blank" href="/user/${commonData.user.username}/settings/">
        <button type="button"
          class="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-900 ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white k-bg-primary">
          Send another verification mail
        </button>
      </a>`;
    }
    return `Please validate your email and prove that you are not a bot 
    ${htmlButton}   
    `;
  }

  public static noVerifiedEmailError(commonData: CommonData): string {
    let htmlButton = '';

    if (commonData && commonData.user && commonData.user.username) {
      htmlButton = `<a target="_blank" href="/user/${commonData.user.username}/settings/">
        <button type="button"
          class="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-900 ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white k-bg-primary">
          Send another verification mail
        </button>
      </a>`;
    }
    return `Please <b>verify your email account</b> to be able to make changes on Kyso.
    ${htmlButton}
    `;
  }

  public static noCaptchaSolvedError(): string {
    return 'Please prove that you are not a bot';
  }

  public static noEnoughPermissions(): string {
    return `Sorry, but you don't have enough permissions to perform this action`;
  }
}
