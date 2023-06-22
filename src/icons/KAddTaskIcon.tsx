import type { CSSProperties } from 'react';

type IKTasksIcon = {
  style?: CSSProperties | undefined;
  className?: string | undefined;
};

const KAddTasksIcon = ({ style, className }: IKTasksIcon) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 129 129" style={style} className={className}>
      <g id="Add_task_button" data-name="Add task button" transform="translate(-1061 -120)">
        <rect id="Picker_Border_Stroke_" data-name="Picker Border (Stroke)" width="129" height="129" rx="4" transform="translate(1061 120)" fill="none" />
        <g id="Rectángulo_706" data-name="Rectángulo 706" transform="translate(1063 124)" fill="#fff" stroke="#fff" strokeWidth="1">
          <rect width="123" height="123" rx="2" stroke="none" />
          <rect x="0.5" y="0.5" width="122" height="122" rx="1.5" fill="none" />
        </g>
        <path
          id="Path_-_Contorno"
          data-name="Path - Contorno"
          d="M40.31,4.047A36.42,36.42,0,1,0,76.589,40.466,36.391,36.391,0,0,0,40.31,4.047M40.31,0A40.466,40.466,0,1,1,0,40.466,40.4,40.4,0,0,1,40.31,0Z"
          transform="translate(1079.321 144.096)"
          fill="#707070"
        />
        <g id="Rectángulo_705" data-name="Rectángulo 705" transform="translate(1127.513 148.915)" fill="#fff" stroke="#fff" strokeWidth="1">
          <rect width="38.554" height="67.943" stroke="none" />
          <rect x="0.5" y="0.5" width="37.554" height="66.943" fill="none" />
        </g>
        <path id="Path" d="M66.478,0l-37.8,40.16L8.088,18.343,0,26.936l28.679,30.47L74.566,8.654Z" transform="translate(1091.469 150.19)" fill="#707070" />
        <path id="_Color" data-name=" ↳Color" d="M31.325,17.9H17.9V31.325H13.425V17.9H0V13.425H13.425V0H17.9V13.425H31.325Z" transform="translate(1140.384 187.229)" fill="#707070" />
      </g>
    </svg>
  );
};

export default KAddTasksIcon;
