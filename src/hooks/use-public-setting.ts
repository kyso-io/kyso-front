/* eslint-disable @typescript-eslint/no-explicit-any */
import type { KysoSetting, KysoSettingsEnum } from '@kyso-io/kyso-model';
import type { KysoSettingsState } from '@kyso-io/kyso-store';
import { useEffect, useState } from 'react';
import { useAppSelector } from './redux-hooks';

export const usePublicSetting = (key: KysoSettingsEnum): any | null => {
  const kysoSettingsState: KysoSettingsState = useAppSelector((state) => state.kysoSettings);
  const [value, setValue] = useState<any | null>(null);

  useEffect(() => {
    if (!kysoSettingsState || kysoSettingsState.publicSettings.length === 0) {
      return;
    }
    const index: number = kysoSettingsState.publicSettings.findIndex((kysoSetting: KysoSetting) => kysoSetting.key === key);
    if (index === -1) {
      return;
    }
    setValue(kysoSettingsState.publicSettings[index]!.value);
  }, [kysoSettingsState]);

  return value;
};
