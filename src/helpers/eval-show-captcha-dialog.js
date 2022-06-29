const showCaptchaDialogHelper = (
  userShowCaptcha,
  settingGloballyEnabledCaptcha
) => {
  // Hack to convert to boolean
  /* eslint-disable no-param-reassign */
  settingGloballyEnabledCaptcha = settingGloballyEnabledCaptcha === 'true';

  if (!settingGloballyEnabledCaptcha) {
    return false;
  }

  return userShowCaptcha;
};

export default showCaptchaDialogHelper;
