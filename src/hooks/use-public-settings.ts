/* eslint-disable @typescript-eslint/no-explicit-any */
import type { KysoSetting, KysoSettingsEnum } from '@kyso-io/kyso-model';
import type { KysoSettingsState } from '@kyso-io/kyso-store';
import { useEffect, useState } from 'react';
import { useAppSelector } from './redux-hooks';

export const usePublicSettings = (keys: KysoSettingsEnum[]): any | null => {
  const kysoSettingsState: KysoSettingsState = useAppSelector((state) => state.kysoSettings);
  const [values, setValues] = useState<(any | null)[]>([]);

  useEffect(() => {
    if (!kysoSettingsState || kysoSettingsState.publicSettings.length === 0) {
      return;
    }
    const newValues: (any | null)[] = [];
    keys.forEach((key: KysoSettingsEnum) => {
      const index: number = kysoSettingsState.publicSettings.findIndex((kysoSetting: KysoSetting) => kysoSetting.key === key);
      if (index === -1) {
        newValues.push(null);
        return;
      }
      newValues.push(kysoSettingsState.publicSettings[index]!.value);
    });
    setValues(newValues);
  }, [kysoSettingsState]);

  return values;
};
