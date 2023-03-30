/* eslint no-plusplus: "off" */
import { Dialog, Transition } from '@headlessui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import clsx from 'clsx';
import moment from 'moment';
import { Fragment, useEffect, useMemo, useState } from 'react';

interface Props {
  date: Date | null;
  isOpen: boolean;
  onClose: (date: Date | null) => void;
  requesting: boolean;
}

const LIMIT_MONTHS = 2;

const ExpirationDateModal = ({ date, isOpen, onClose, requesting }: Props) => {
  const [selectedDate, setSelectedDate] = useState<Date>(moment().toDate());
  const [currentYearMonth, setCurrentYearMonth] = useState<moment.Moment>(moment().startOf('month'));

  useEffect(() => {
    if (isOpen) {
      if (date && moment(date).isValid() && moment(date).isAfter(moment())) {
        setSelectedDate(date);
        setCurrentYearMonth(moment(date).startOf('month'));
      } else {
        const minMoment: moment.Moment = moment().add(3, 'weeks');
        setSelectedDate(minMoment.toDate());
        setCurrentYearMonth(minMoment.startOf('month'));
      }
    }
  }, [isOpen]);

  const days: moment.Moment[] = useMemo(() => {
    const firstDayOfMonth: moment.Moment = currentYearMonth.clone().startOf('month');
    const lastDayOfMonth: moment.Moment = currentYearMonth.clone().endOf('month');
    let windowDays: moment.Moment[] = [];
    for (let i = 0; i < lastDayOfMonth.date(); i++) {
      windowDays.push(
        firstDayOfMonth
          .clone()
          .date(i + 1)
          .endOf('day'),
      );
    }
    const result: moment.Moment[] = [];
    for (let i = 0; i < firstDayOfMonth.weekday(); i++) {
      result.push(
        firstDayOfMonth
          .clone()
          .subtract(i + 1, 'days')
          .endOf('day'),
      );
    }
    result.reverse();
    windowDays = [...result, ...windowDays];
    for (let i = 0; i < 6 - lastDayOfMonth.weekday(); i++) {
      windowDays.push(
        lastDayOfMonth
          .clone()
          .add(i + 1, 'days')
          .endOf('day'),
      );
    }
    return windowDays;
  }, [currentYearMonth]);

  const disabledPreviousMonthButton: boolean = useMemo(() => {
    const previousMonth: moment.Moment = currentYearMonth.clone().subtract(1, 'months').startOf('month');
    return previousMonth.isBefore(moment().startOf('month'));
  }, [currentYearMonth]);

  const disabledNextMonthButton: boolean = useMemo(() => {
    const nextMonth: moment.Moment = currentYearMonth.clone().add(1, 'months').endOf('month');
    return nextMonth.isAfter(moment().add(LIMIT_MONTHS, 'months').endOf('month'));
  }, [currentYearMonth]);

  const save = () => {
    onClose(selectedDate);
  };

  const closeModal = () => {
    onClose(null);
  };

  const onPreviousMonth = () => {
    const previousMonth: moment.Moment = currentYearMonth.clone().subtract(1, 'months');
    setCurrentYearMonth(previousMonth);
  };

  const onNextMonth = () => {
    const nextMonth: moment.Moment = currentYearMonth.clone().add(1, 'month');
    setCurrentYearMonth(nextMonth);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-gray-500/50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title as="h3" className="text-md font-sm leading-6 text-gray-900">
                      Select expiration date
                    </Dialog.Title>
                    <div className="mt-2">
                      {/* TODO */}
                      <p className="text-sm text-gray-500">By default the expiration date will be three weeks from the current date. You may extend the date up to two months.</p>
                      {/* CALENDAR */}
                      <div className="hidden max-w-md flex-none border-l border-gray-100 py-10 px-8 md:block">
                        <div className="flex items-center text-center text-gray-900">
                          <button
                            disabled={disabledPreviousMonthButton}
                            onClick={onPreviousMonth}
                            type="button"
                            className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                            title="Previous month"
                          >
                            <span className="sr-only">Previous month</span>
                            <ChevronLeftIcon className={clsx('h-5 w-5', disabledPreviousMonthButton ? 'text-gray-300' : 'text-gray-600')} aria-hidden="true" />
                          </button>
                          <div className="flex-auto font-semibold">{currentYearMonth.format('MMMM YYYY')}</div>
                          <button
                            disabled={disabledNextMonthButton}
                            onClick={onNextMonth}
                            type="button"
                            className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                            title="Next month"
                          >
                            <span className="sr-only">Next month</span>
                            <ChevronRightIcon className={clsx('h-5 w-5', disabledNextMonthButton ? 'text-gray-300' : 'text-gray-600')} aria-hidden="true" />
                          </button>
                        </div>
                        <div className="mt-6 grid grid-cols-7 text-center text-xs leading-6 text-gray-500">
                          <div>S</div>
                          <div>M</div>
                          <div>T</div>
                          <div>W</div>
                          <div>T</div>
                          <div>F</div>
                          <div>S</div>
                        </div>
                        <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow ring-1 ring-gray-200">
                          {days.map((day: moment.Moment, dayIndex: number) => {
                            const isSelected: boolean = day.isSame(selectedDate, 'day');
                            const isToday: boolean = day.isSame(moment(), 'day');
                            const canBeSelected: boolean =
                              day.isSameOrAfter(moment().startOf('day').add(1, 'day'), 'day') && day.isSameOrBefore(moment().add(LIMIT_MONTHS, 'months').endOf('day'), 'day');
                            const datetime: string = day.format('YYYY-MM-DD');
                            return (
                              <button
                                disabled={!canBeSelected}
                                onClick={() => {
                                  setSelectedDate(day.toDate());
                                }}
                                key={datetime}
                                type="button"
                                className={clsx(
                                  'py-1.5 hover:bg-gray-100 focus:z-10',
                                  canBeSelected ? 'bg-white' : 'bg-gray-50 cursor-not-allowed',
                                  isSelected && 'font-semibold',
                                  isSelected && 'text-white',
                                  !isSelected && canBeSelected && !isToday && 'text-gray-900',
                                  !isSelected && !canBeSelected && 'text-gray-400',
                                  dayIndex === 0 && 'rounded-tl-lg',
                                  dayIndex === 6 && 'rounded-tr-lg',
                                  dayIndex === days.length - 7 && 'rounded-bl-lg',
                                  dayIndex === days.length - 1 && 'rounded-br-lg',
                                )}
                              >
                                <time
                                  dateTime={datetime}
                                  className={clsx('mx-auto flex h-7 w-7 items-center justify-center rounded-full', isSelected && isToday && 'bg-indigo-600', isSelected && !isToday && 'bg-gray-900')}
                                >
                                  {day.format('D')}
                                </time>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* FOOTER */}
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    disabled={requesting}
                    type="button"
                    className={clsx(
                      'inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm',
                      requesting ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
                    )}
                    onClick={save}
                    style={{ backgroundColor: '#2E4060' }}
                  >
                    {date ? 'Save' : 'Create'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ExpirationDateModal;
