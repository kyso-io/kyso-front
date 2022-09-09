import { useState, useEffect } from 'react';

interface Props {
  active?: boolean;
}

export const useNavigateToHashOnce = (props: Props) => {
  const { active = true } = props;

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(() => true);
  }, []);

  const [hasDoneOnce, setHasDoneOnce] = useState(false);

  useEffect(() => {
    if (!isMounted) {
      return;
    }
    if (active && window && !hasDoneOnce) {
      const { hash } = window.location;
      if (hash && hash !== '') {
        window.location.hash = hash;
      }
      setHasDoneOnce(true);
    }
  }, [isMounted, window.location.hash]);
};
