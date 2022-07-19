/* eslint-disable @typescript-eslint/no-explicit-any */
const showCaptchaDialogHelper = (userShowCaptcha: boolean, settingGloballyEnabledCaptcha: any) => {
  // Hack to convert to boolean
  /* eslint-disable no-param-reassign */
  settingGloballyEnabledCaptcha = settingGloballyEnabledCaptcha === 'true';

  if (!settingGloballyEnabledCaptcha) {
    return false;
  }

  return userShowCaptcha;
};

export default showCaptchaDialogHelper;
