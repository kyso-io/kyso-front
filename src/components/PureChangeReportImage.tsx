/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NormalizedResponseDTO, ReportDTO } from '@kyso-io/kyso-model';
import React, { useRef, useState } from 'react';
import type { CommonData } from '@/types/common-data';
import { InformationCircleIcon, PlusSmIcon as PlusSmIconSolid } from '@heroicons/react/solid';
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
      <img className="object-cover" style={{ width: 200, height: 200 }} src={picture} alt="report preview image" />
      {hasPermissionEditReport && (
        <div className="absolute top-5 left-40">
          <button
            type="button"
            onClick={() => imageInputFileRef.current.click()}
            className="inline-flex items-center p-1 border border-gray-700 rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-100  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            title="Change background image"
          >
            <PlusSmIconSolid className="h-5 w-5" aria-hidden="true" />
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
