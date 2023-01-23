/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NormalizedResponseDTO, ReportDTO } from '@kyso-io/kyso-model';
import React, { useRef, useState } from 'react';
import type { CommonData } from '@/types/common-data';
import { InformationCircleIcon } from '@heroicons/react/solid';
import { Api } from '@kyso-io/kyso-store';
import ToasterNotification from '@/components/ToasterNotification';

interface IPureChangeReportImage {
  report: ReportDTO;
  commonData: CommonData;
  reportImage: string;
  hasPermissionEditReport: boolean;
}

const PureChangeReportImage = (props: IPureChangeReportImage) => {
  const { hasPermissionEditReport, commonData, reportImage, report } = props;
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const [messageToaster, setMessageToaster] = useState<string>('');
  const [picture, setPicture] = useState<string>(reportImage);
  const imageInputFileRef = useRef<any>(null);

  const updateReportImage = async (file: File) => {
    try {
      setShowToaster(true);
      setMessageToaster('Uploading image...');
      const api: Api = new Api(commonData.token);
      api.setOrganizationSlug(commonData.organization?.sluglified_name!);
      api.setTeamSlug(commonData.team?.sluglified_name!);
      const response: NormalizedResponseDTO<ReportDTO> = await api.updateReportImage(report.id!, file!);
      const r: ReportDTO = response.data;
      setPicture(r.preview_picture);
      setMessageToaster('Image uploaded successfully!');
      setTimeout(() => {
        setShowToaster(false);
      }, 3000);
    } catch (e) {
      setMessageToaster('An error occurred uploading the image. Please try again');
      setTimeout(() => {
        setShowToaster(false);
      }, 3000);
    }
  };

  return (
    <div className="bg-stripes-sky-blue rounded-tl-lg text-center overflow-hidden mx-auto border-r border-r-gray-200">
      <ToasterNotification show={showToaster} setShow={setShowToaster} message={messageToaster} icon={<InformationCircleIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />} />
      <img
        className="object-cover w-24 md:w-[200px] k-edit-report-image"
        src={picture}
        alt="report preview image"
        onClick={() => {
          if (imageInputFileRef && imageInputFileRef.current) {
            imageInputFileRef.current.click();
          }
        }}
      />
      {hasPermissionEditReport && (
        <div className="hidden md:block absolute w-24 h-full md:w-[200px] k-edit-report-badge">
          <button
            type="button"
            onClick={() => imageInputFileRef.current.click()}
            className="inline-flex items-center shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            title="Change background image"
            style={{
              marginTop: '90px',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
              />
            </svg>
          </button>
          <input
            ref={imageInputFileRef}
            type="file"
            accept="image/*"
            onClick={(event: any) => {
              event.target.value = null;
            }}
            onChange={(e: any) => {
              if (e.target.files.length > 0) {
                updateReportImage(e.target.files[0]);
              }
            }}
            style={{ display: 'none' }}
          />
        </div>
      )}
    </div>
  );
};

export default PureChangeReportImage;
