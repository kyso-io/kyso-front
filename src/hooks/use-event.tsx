/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useState } from 'react';

const EventContext = createContext<any>(null);

export const EventProvider = ({ children }: any) => {
  const [eventListeners, setEventListeners] = useState<any[]>([]);

  const subscribeEvent = (callback: any) => {
    setEventListeners((prevListeners: any) => [...prevListeners, callback]);
  };

  const emitEvent = (data: { type: string; payload: any }) => {
    eventListeners.forEach((listener: any) => listener(data));
  };

  return <EventContext.Provider value={{ subscribeEvent, emitEvent }}>{children}</EventContext.Provider>;
};

export const useEvent = () => {
  return useContext(EventContext);
};
